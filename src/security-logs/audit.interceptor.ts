import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AuditEvent } from './event-types';
import { AuditOutcome } from './entities/security-log.entity';
import { SecurityLogsService } from './security-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly logs: SecurityLogsService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const path: string = request.path;

    if (path.startsWith('/security-logs')) return next.handle();

    // Login has no request.user yet (that's the whole point of the
    // request), so it can't go through the generic path below. Pull the
    // actor out of the response body instead once the handler succeeds.
    if (request.method === 'POST' && path === '/auth/login') {
      return next.handle().pipe(
        mergeMap((result) =>
          from(this.recordLogin(request, result)).pipe(map(() => result)),
        ),
      );
    }

    // Logout does have request.user (it's a protected route), but it's
    // still under /auth, which the generic path below excludes entirely.
    if (request.method === 'POST' && path === '/auth/logout' && request.user) {
      return next.handle().pipe(
        mergeMap((result) =>
          from(this.recordLogout(request)).pipe(map(() => result)),
        ),
      );
    }

    if (!request.user || path.startsWith('/auth')) return next.handle();

    const eventType = this.eventType(request.method, path);
    if (!eventType) return next.handle();

    return next.handle().pipe(
      mergeMap((result) =>
        from(
          this.logs.record({
            eventType,
            actionOutcome: AuditOutcome.Success,
            actorUserId: String(request.user.sub),
            actorRoleAtTime: request.user.role,
            sessionId: request.user.sid,
            sourceIp: request.ip,
            userAgent: request.get('user-agent'),
            targetResourceType: this.resource(path),
            targetResourceId: request.params?.id,
            metadata: { method: request.method, path },
          }),
        ).pipe(map(() => result)),
      ),
    );
  }

  private async recordLogin(request: any, result: { token?: string }): Promise<void> {
    const actor = this.extractLoginActor(result);
    await this.logs.record({
      eventType: AuditEvent.LoginSuccess,
      actionOutcome: AuditOutcome.Success,
      actorUserId: actor.userId,
      actorRoleAtTime: actor.role,
      // No session id concept in this app's JWT payload (just sub + role),
      // so sessionId is intentionally omitted here.
      sourceIp: request.ip,
      userAgent: request.get('user-agent'),
      metadata: { method: 'POST', path: '/auth/login' },
    });
  }

  private async recordLogout(request: any): Promise<void> {
    await this.logs.record({
      eventType: AuditEvent.Logout,
      actionOutcome: AuditOutcome.Success,
      actorUserId: String(request.user.sub),
      actorRoleAtTime: request.user.role,
      sourceIp: request.ip,
      userAgent: request.get('user-agent'),
      metadata: { method: 'POST', path: '/auth/logout' },
    });
  }

  /**
   * The login response is just { token }, with no user object attached.
   * The actor's id/role live inside the JWT payload itself, so decode the
   * token AuthService just issued. This is `decode`, not `verify` - we
   * signed it ourselves a moment ago in the same request, so
   * re-verification would be redundant.
   */
  private extractLoginActor(result: { token?: string }): { userId?: string; role?: string } {
    if (!result?.token) return {};
    const payload = this.jwtService.decode(result.token) as { sub?: number; role?: string } | null;
    return {
      userId: payload?.sub !== undefined ? String(payload.sub) : undefined,
      role: payload?.role,
    };
  }

  private eventType(method: string, path: string) {
    if (method === 'PATCH' && /^\/students\/\d+$/.test(path)) return undefined;
    if (method === 'GET' && /download|all-progress/.test(path)) return AuditEvent.BulkExport;
    if (method === 'GET' && /search|filter/.test(path)) return AuditEvent.RecordSearch;
    if (method === 'GET' && /breakdown|progress|participation$/.test(path)) return AuditEvent.ReportGenerated;
    if (method === 'GET' && /\/\d+$/.test(path)) return AuditEvent.RecordView;
    if (method === 'POST' && /uploads/.test(path)) return AuditEvent.BulkImport;
    if (method === 'POST') return AuditEvent.RecordCreated;
    if (method === 'PATCH' || method === 'PUT') return AuditEvent.RecordUpdated;
    if (method === 'DELETE') return AuditEvent.RecordDeleted;
    if (method === 'GET') return AuditEvent.RecordView;
    return undefined;
  }

  private resource(path: string) {
    return path.split('/').filter(Boolean)[0]?.replace(/-/g, '_') ?? 'system';
  }
}