import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { SecurityLogsService } from '../../security-logs/security-logs.service';
import { AuditEvent } from '../../security-logs/event-types';
import { AuditOutcome } from '../../security-logs/entities/security-log.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private securityLogs: SecurityLogsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const allowed = requiredRoles.some((role) => user.role?.includes(role));
    if (!allowed) {
      const contextData = { actorUserId: String(user?.sub), actorRoleAtTime: user?.role, sessionId: user?.sid, sourceIp: request.ip, userAgent: request.get('user-agent'), targetResourceType: `${request.method} ${request.route?.path ?? request.path}`, denialReason: `Role ${user?.role ?? 'unknown'} lacks required role` };
      await this.securityLogs.record({ eventType: AuditEvent.AccessDenied, actionOutcome: AuditOutcome.Denied, ...contextData });
      await this.securityLogs.record({ eventType: AuditEvent.PrivilegeEscalation, actionOutcome: AuditOutcome.Denied, ...contextData });
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
