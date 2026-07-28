import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { AuditEvent } from './event-types';
import { AuditOutcome } from './entities/security-log.entity';
import { SecurityLogsService } from './security-logs.service';

@Catch()
export class AuditExceptionFilter extends BaseExceptionFilter {
  constructor(adapterHost: HttpAdapterHost, private readonly logs: SecurityLogsService) { super(adapterHost.httpAdapter); }

  catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    if (status >= 400 && !request.path.startsWith('/security-logs')) {
      const user = request.user;
      void this.logs.record({
        eventType: status === 401 ? AuditEvent.LoginFailure : AuditEvent.ApplicationError, 
        actionOutcome: AuditOutcome.Failure,
        actorUserId: user?.sub?.toString(), 
        actorRoleAtTime: user?.role, 
        sessionId: user?.sid,
        sourceIp: request.ip, 
        userAgent: request.get?.('user-agent'), 
        targetResourceType: `${request.method} ${request.path}`,
        metadata: { status, error: exception instanceof HttpException ? exception.name : 'InternalServerError' },
      }).catch(() => undefined);
    }
    super.catch(exception, host);
  }
}
