import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RequestMetadata } from './auth.service';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class SessionsService {
  constructor(@InjectRepository(UserSession) private readonly sessions: Repository<UserSession>, private readonly config: ConfigService) {}

  async create(user: User, metadata: RequestMetadata) {
    const minutes = Number(this.config.get('SESSION_IDLE_MINUTES') ?? 60 * 24);
    const fingerprint = this.fingerprint(metadata);
    const active = await this.sessions.find({ where: { user: { id: user.id }, endedAt: null } });
    const concurrent = active.some(s => s.ipAddress !== metadata.ipAddress || s.deviceFingerprint !== fingerprint);
    const knownDevice = active.some(s => s.deviceFingerprint === fingerprint && s.ipAddress === metadata.ipAddress);
    const now = new Date();
    const session = this.sessions.create({ id: randomUUID(), user, ipAddress: metadata.ipAddress, userAgent: metadata.userAgent, deviceFingerprint: fingerprint, expiresAt: new Date(now.getTime() + minutes * 60_000), lastActivityAt: now });
    return { session: await this.sessions.save(session), concurrent, newDevice: !knownDevice };
  }

  async validate(id: string, userId: number) {
    const session = await this.sessions.findOne({ where: { id, user: { id: userId } }, relations: ['user'] });
    if (!session || session.endedAt) return { valid: false, session };
    if (session.expiresAt <= new Date()) {
      await this.end(id, 'expired');
      return { valid: false, session, expired: true };
    }
    const heartbeat = !session.lastActivityAt || Date.now() - session.lastActivityAt.getTime() > 5 * 60_000;
    if (heartbeat) await this.sessions.update(id, { lastActivityAt: new Date() });
    return { valid: true, session, heartbeat };
  }

  async end(id: string, reason: string) { await this.sessions.update(id, { endedAt: new Date(), endReason: reason }); }
  private fingerprint(metadata: RequestMetadata) { return createHash('sha256').update(`${metadata.ipAddress ?? ''}|${metadata.userAgent ?? ''}`).digest('hex'); }
}
