import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { SecurityLogsService } from './security-logs.service';

@ApiTags('Security logs')
@ApiBearerAuth('JWT-auth')
@Controller('security-logs')
export class SecurityLogsController {
  constructor(private readonly securityLogsService: SecurityLogsService) {}

  @Get()
  @Roles(Role.Admin)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('eventType') eventType?: string,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.securityLogsService.findAll(page, limit, eventType, actorUserId);
  }

  @Get('verify')
  @Roles(Role.Admin)
  verifyIntegrity() { return this.securityLogsService.verifyIntegrity(); }
}
