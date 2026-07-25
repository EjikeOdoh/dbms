import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityLog } from './entities/security-log.entity';
import { SecurityLogsController } from './security-logs.controller';
import { SecurityLogsService } from './security-logs.service';
import { AuditInterceptor } from './audit.interceptor';
import { FileSecurityService } from './file-security.service';
import { AuditExceptionFilter } from './audit-exception.filter';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityLog], 'audit')],
  controllers: [SecurityLogsController],
  providers: [SecurityLogsService, AuditInterceptor, AuditExceptionFilter, FileSecurityService],
  exports: [SecurityLogsService, AuditInterceptor, AuditExceptionFilter, FileSecurityService],
})
export class SecurityLogsModule {}
