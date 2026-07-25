import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SecurityLogsService } from 'src/security-logs/security-logs.service';
import { AuditEvent } from 'src/security-logs/event-types';
import { AuditOutcome } from 'src/security-logs/entities/security-log.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly audit: SecurityLogsService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const user = await this.usersService.create(createUserDto);
    await this.record(req, AuditEvent.UserProvisioned, user.id, { role: user.role });
    if (user.role === 'admin') await this.record(req, AuditEvent.AdminLifecycle, user.id, { action: 'created' });
    return user;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const before = await this.usersService.findOne(+id);
    const user = await this.usersService.update(+id, updateUserDto);
    if (updateUserDto.role && updateUserDto.role !== before.role) {
      await this.record(req, AuditEvent.RoleChange, id, { from: before.role, to: updateUserDto.role });
    }
    if (updateUserDto.password) await this.record(req, AuditEvent.PasswordChange, id, { initiatedByAdmin: Number(req.user.sub) !== +id });
    return user;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const before = await this.usersService.findOne(+id);
    const result = await this.usersService.remove(+id);
    await this.record(req, AuditEvent.UserDeprovisioned, id);
    if (before.role === 'admin') await this.record(req, AuditEvent.AdminLifecycle, id, { action: 'deleted' });
    return result;
  }

  private record(req: any, eventType: any, targetResourceId: string | number, metadata?: Record<string, unknown>) {
    return this.audit.record({ eventType, actionOutcome: AuditOutcome.Success, actorUserId: String(req.user.sub), actorRoleAtTime: req.user.role, sessionId: req.user.sid, sourceIp: req.ip, userAgent: req.get('user-agent'), targetResourceType: 'user', targetResourceId, metadata });
  }
}
