import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AuditEvent } from './event-types';
import { AuditOutcome } from './entities/security-log.entity';
import { SecurityLogsService } from './security-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly logs: SecurityLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    if (!request.user || request.path.startsWith('/security-logs') || request.path.startsWith('/auth')) return next.handle();
    const eventType = this.eventType(request.method, request.path);
    if (!eventType) return next.handle();
    return next.handle().pipe(mergeMap(result => from(this.logs.record({
      eventType,
      actionOutcome: AuditOutcome.Success,
      actorUserId: String(request.user.sub), actorRoleAtTime: request.user.role,
      sessionId: request.user.sid, sourceIp: request.ip, userAgent: request.get('user-agent'),
      targetResourceType: this.resource(request.path), targetResourceId: request.params?.id,
      metadata: { method: request.method, path: request.path },
    })).pipe(map(() => result))));
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
    return undefined;
  }
  private resource(path: string) { return path.split('/').filter(Boolean)[0]?.replace(/-/g, '_') ?? 'system'; }
}
