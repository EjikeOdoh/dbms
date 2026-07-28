import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { SecurityLogsService } from './security-logs.service';
import { AuditEventType } from './event-types';
import { ObjectId } from 'mongodb';

@ApiTags('Security logs')
@ApiBearerAuth('JWT-auth')
@Roles(Role.Admin)
@Controller('security-logs')
export class SecurityLogsController {
  constructor(private readonly securityLogsService: SecurityLogsService) { }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('eventType') eventType?: AuditEventType,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return await this.securityLogsService.findAll(page, limit, eventType, actorUserId);
  }

  @Get(":id")
  async findOne(@Param("id") id: ObjectId) {
    return await this.securityLogsService.findOne(id)
  }

}
