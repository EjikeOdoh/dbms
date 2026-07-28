import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AuditEventType } from './event-types';
import { AuditOutcome, SecurityLog } from './entities/security-log.entity';
import { ObjectId } from 'mongodb';

export type AuditContext = {
  actorUserId?: string | number;
  actorRoleAtTime?: string;
  actorDisplayName?: string;
  sourceIp?: string;
  userAgent?: string;
  sessionId?: string;
};

export type SecurityEvent = AuditContext & {
  eventType: AuditEventType;
  actionOutcome: AuditOutcome;
  targetResourceType?: string;
  targetResourceId?: string | number;
  changedFields?: string[];
  valueDelta?: Record<string, unknown>;
  fileHash?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  denialReason?: string;
  geolocation?: string;
  metadata?: Record<string, unknown>;
};

export type ChainVerificationResult = {
  valid: boolean;
  checkedCount: number;
  firstBrokenEventId?: string;
  reason?: string;
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

/** Deterministically stringify a value so hashing is stable regardless of
 * key insertion order. */
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

@Injectable()
export class SecurityLogsService {
  constructor(
    @InjectRepository(SecurityLog, 'audit') private readonly repository: Repository<SecurityLog>,
    private readonly config: ConfigService,
  ) { }

  private canonicalPayload(event: Partial<SecurityLog>): string {
    return stable({
      eventType: event.eventType,
      actionOutcome: event.actionOutcome,
      actorUserId: event.actorUserId ?? null,
      actorRoleAtTime: event.actorRoleAtTime ?? null,
      actorDisplayName: event.actorDisplayName ?? null,
      sourceIp: event.sourceIp ?? null,
      userAgent: event.userAgent ?? null,
      sessionId: event.sessionId ?? null,
      targetResourceType: event.targetResourceType ?? null,
      targetResourceId: event.targetResourceId ?? null,
      changedFields: event.changedFields ?? null,
      fileHash: event.fileHash ?? null,
      fileName: event.fileName ?? null,
      fileSize: event.fileSize ?? null,
      mimeType: event.mimeType ?? null,
      denialReason: event.denialReason ?? null,
      geolocation: event.geolocation ?? null,
      metadata: event.metadata ?? null,
      timestampUtc: event.timestampUtc?.toISOString?.() ?? event.timestampUtc ?? null,
      previousIntegrityHash: event.previousIntegrityHash ?? null,
    });
  }

  private computeIntegrityHash(event: Partial<SecurityLog>): string {
    const secret = this.config.get<string>('AUDIT_LOG_HMAC_SECRET');
    if (!secret) {
      throw new Error('AUDIT_LOG_HMAC_SECRET is not configured; refusing to write audit log');
    }
    return createHmac('sha256', secret).update(this.canonicalPayload(event)).digest('hex');
  }

  async record(entry: SecurityEvent): Promise<SecurityLog> {
    const previous = await this.repository.findOne({
      where: {},
      order: { timestampUtc: 'DESC' },
    });

    const event = this.repository.create({
      eventType: entry.eventType,
      actionOutcome: entry.actionOutcome,
      actorUserId: entry.actorUserId?.toString(),
      actorRoleAtTime: entry.actorRoleAtTime,
      actorDisplayName: entry.actorDisplayName,
      sourceIp: entry.sourceIp,
      userAgent: entry.userAgent,
      sessionId: entry.sessionId,
      targetResourceType: entry.targetResourceType,
      targetResourceId: entry.targetResourceId?.toString(),
      changedFields: entry.changedFields,
      fileHash: entry.fileHash,
      fileName: entry.fileName,
      fileSize: entry.fileSize?.toString(),
      mimeType: entry.mimeType,
      denialReason: entry.denialReason,
      geolocation: entry.geolocation,
      metadata: entry.metadata,
      previousIntegrityHash: previous?.logIntegrityHash ?? null,
      logIntegrityHash: '',
    });
    event.timestampUtc = new Date();
    event.logIntegrityHash = this.computeIntegrityHash(event);

    return this.repository.save(event);
  }

  async findAll(page = 1, limit = DEFAULT_PAGE_SIZE, eventType?: AuditEventType, actorUserId?: string) {
    const safePage = Math.max(1, Math.trunc(page) || 1);
    const safeLimit = Math.max(1, Math.min(Math.trunc(limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE));

    const where: Record<string, string> = {};
    if (eventType) where.eventType = eventType;
    if (actorUserId) where.actorUserId = actorUserId;

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { timestampUtc: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string | ObjectId): Promise<SecurityLog | null> {
    let objectId: ObjectId;

    if (typeof id === 'string') {
      if (!ObjectId.isValid(id)) return null;
      objectId = new ObjectId(id);
    } else {
      objectId = id;
    }

    try {
      return await this.repository.findOneOrFail({ where: { _id: objectId } });
    } catch {
      return null;
    }
  }

  async verifyChain(): Promise<ChainVerificationResult> {
    const rows = await this.repository.find({
      order: { timestampUtc: 'ASC', },
    });

    let expectedPrevious: string | null = null;

    for (const row of rows) {
      if ((row.previousIntegrityHash ?? null) !== expectedPrevious) {
        return {
          valid: false,
          checkedCount: rows.length,
          reason: 'previousIntegrityHash does not match the prior row in sequence',
        };
      }

      const recomputed = this.computeIntegrityHash(row);
      if (recomputed !== row.logIntegrityHash) {
        return {
          valid: false,
          checkedCount: rows.length,
          reason: 'logIntegrityHash does not match recomputed hash',
        };
      }

      expectedPrevious = row.logIntegrityHash;
    }

    return { valid: true, checkedCount: rows.length };
  }
}