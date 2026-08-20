import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  private readonly IDLE_TIMEOUT_MINUTES = 5;
  private readonly REFRESH_WINDOW_MINUTES = 2;

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) { }

  /**
   * Creates a new session after successful login.
   */
  async create(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      userId,
      ipAddress,
      userAgent,
      isActive: true,
      lastActivityAt: new Date(),
    });

    return await this.sessionRepository.save(session);
  }

  /**
   * Finds a session by its ID.
   */
  async findById(id: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { id },
    });
  }

  /**
   * Updates the last activity timestamp.
   * Only refreshes the session when the user becomes active near the end
   * of the idle timeout window, so normal requests do not reset it.
   */
  async updateActivity(
    session: Session,
    timeIn: Date
  ): Promise<Session> {

    const elapsed = new Date(timeIn).getTime() - session.lastActivityAt.getTime();
      console.log("Elapsed:",elapsed)

    const idleTimeoutMs =
      this.IDLE_TIMEOUT_MINUTES * 60 * 1000;
    const refreshWindowMs =
      this.REFRESH_WINDOW_MINUTES * 60 * 1000;

    if (elapsed < idleTimeoutMs) {
      Logger.log("Fresh")
      if (elapsed >= refreshWindowMs) {
        Logger.log("Stale")
        session.lastActivityAt = new Date();
        return await this.sessionRepository.save(session);
      }
      return session;
    }

    return session;
  }

  /**
   * Returns true if the session has exceeded
   * the inactivity timeout.
   */
  isExpired(session: Session, timeIn?: Date): boolean {
    const now = new Date(timeIn);
    console.log(now)

    const elapsed =
      now.getTime() - session.lastActivityAt.getTime();

    const minutes = elapsed / (1000 * 60);

    return minutes >= this.IDLE_TIMEOUT_MINUTES;
  }

  /**
   * Checks whether the session is still valid.
   * Throws UnauthorizedException if not.
   */
  async validate(sessionId: string, timeIn?: Date): Promise<Session> {
    const session = await this.findById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found.');
    }

    if (!session.isActive) {
      throw new UnauthorizedException(
        'Session is inactive.',
      );
    }

    if (this.isExpired(session)) {
      session.isActive = false;
      session.logoutAt = new Date();

      await this.sessionRepository.save(session);

      throw new UnauthorizedException(
        'Session expired due to inactivity.',
      );
    }

    await this.updateActivity(session, timeIn);

    return session;
  }

  /**
   * Logs out a single session.
   */
  async revoke(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      isActive: false,
      logoutAt: new Date(),
    });
  }

  /**
   * Logs out every session for a user.
   */
  async revokeAll(userId: number): Promise<void> {
    await this.sessionRepository.update(
      {
        userId,
        isActive: true,
      },
      {
        isActive: false,
        logoutAt: new Date(),
      },
    );
  }

  /**
   * Returns all active sessions for a user.
   */
  async findActiveSessions(
    userId: number,
  ): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        lastActivityAt: 'DESC',
      },
    });
  }

  /**
   * Deletes sessions that have been inactive
   * for a long period.
   *
   * Intended for a scheduled cron job.
   */
  async deleteOldSessions(days = 30): Promise<void> {
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);

    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('isActive = false')
      .andWhere('logoutAt IS NOT NULL')
      .andWhere('logoutAt < :cutoff', { cutoff })
      .execute();
  }
}