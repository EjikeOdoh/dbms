import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { encryptSecret } from '../utils/totp';
import { AuditEventType } from './event-types';
import { AuditOutcome, SecurityLog } from './entities/security-log.entity';

export type AuditContext = {
  actorUserId?: string | number; actorRoleAtTime?: string; actorDisplayName?: string;
  sourceIp?: string; userAgent?: string; sessionId?: string;
};
export type SecurityEvent = AuditContext & {
  eventType: AuditEventType; actionOutcome: AuditOutcome; targetResourceType?: string;
  targetResourceId?: string | number; changedFields?: string[]; valueDelta?: Record<string, unknown>;
  fileHash?: string; fileName?: string; fileSize?: number; mimeType?: string;
  denialReason?: string; geolocation?: string; metadata?: Record<string, unknown>;
};

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

@Injectable()
export class SecurityLogsService implements OnModuleInit {
  constructor(
    @InjectRepository(SecurityLog, 'audit') private readonly repository: Repository<SecurityLog>,
    @InjectDataSource('audit') private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    // The trigger protects audit records even when a future code path uses a repository directly.
    await this.dataSource.query(`CREATE OR REPLACE FUNCTION prevent_audit_log_mutation() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'audit logs are append-only'; END; $$ LANGUAGE plpgsql`);
    await this.dataSource.query(`DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs`);
    await this.dataSource.query(`CREATE TRIGGER audit_logs_immutable BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation()`);
  }

  async record(entry: SecurityEvent): Promise<SecurityLog> {
    return this.dataSource.transaction(async manager => {
      await manager.query('SELECT pg_advisory_xact_lock(918273)');
      const repository = manager.getRepository(SecurityLog);
      const previous = await repository
        .createQueryBuilder('audit')
        .orderBy('audit.timestampUtc', 'DESC')
        .addOrderBy('audit.eventId', 'DESC')
        .getOne();
      const eventId = randomUUID();
      const event = repository.create({
        eventId, eventType: entry.eventType, actionOutcome: entry.actionOutcome,
        actorUserId: entry.actorUserId?.toString(), actorRoleAtTime: entry.actorRoleAtTime,
        actorDisplayName: entry.actorDisplayName, sourceIp: entry.sourceIp, userAgent: entry.userAgent,
        sessionId: entry.sessionId, targetResourceType: entry.targetResourceType,
        targetResourceId: entry.targetResourceId?.toString(), changedFields: entry.changedFields,
        encryptedValueDelta: entry.valueDelta ? this.encryptDelta(entry.valueDelta) : undefined,
        fileHash: entry.fileHash, fileName: entry.fileName, fileSize: entry.fileSize?.toString(),
        mimeType: entry.mimeType, denialReason: entry.denialReason, geolocation: entry.geolocation,
        metadata: entry.metadata, previousIntegrityHash: previous?.logIntegrityHash,
        logIntegrityHash: '',
      });
      event.timestampUtc = new Date();
      event.logIntegrityHash = this.hash(event);
      return repository.save(event);
    });
  }

  async findAll(page = 1, limit = 50, eventType?: string, actorUserId?: string) {
    const where: Record<string, string> = {};
    if (eventType) where.eventType = eventType;
    if (actorUserId) where.actorUserId = actorUserId;
    const [data, total] = await this.repository.findAndCount({ where, order: { timestampUtc: 'DESC' }, skip: (page - 1) * limit, take: Math.min(limit, 100) });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async verifyIntegrity() {
    const logs = await this.repository.find({ order: { timestampUtc: 'ASC' } });
    let previous: string | undefined;
    for (const log of logs) {
      if (log.previousIntegrityHash !== previous || log.logIntegrityHash !== this.hash(log)) return { valid: false, eventId: log.eventId };
      previous = log.logIntegrityHash;
    }
    return { valid: true, count: logs.length };
  }

  private encryptDelta(value: Record<string, unknown>) {
    const key = this.config.get<string>('AUDIT_ENCRYPTION_KEY');
    if (!key) throw new Error('AUDIT_ENCRYPTION_KEY must be configured');
    return encryptSecret(JSON.stringify(value), key);
  }
  private hash(log: SecurityLog) {
    const payload = stable({
      eventId: log.eventId, eventType: log.eventType, timestampUtc: log.timestampUtc?.toISOString(),
      actorUserId: log.actorUserId, actorRoleAtTime: log.actorRoleAtTime, actorDisplayName: log.actorDisplayName,
      sourceIp: log.sourceIp, userAgent: log.userAgent, sessionId: log.sessionId,
      targetResourceType: log.targetResourceType, targetResourceId: log.targetResourceId, actionOutcome: log.actionOutcome,
      changedFields: log.changedFields, encryptedValueDelta: log.encryptedValueDelta,
      fileHash: log.fileHash, fileName: log.fileName, fileSize: log.fileSize, mimeType: log.mimeType,
      denialReason: log.denialReason, geolocation: log.geolocation, metadata: log.metadata,
      previousIntegrityHash: log.previousIntegrityHash,
    });
    return `sha256:${createHash('sha256').update(payload).digest('hex')}`;
  }
}
