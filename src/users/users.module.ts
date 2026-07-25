import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { StaffModule } from 'src/staff/staff.module';
import { VolunteersModule } from 'src/volunteers/volunteers.module';
import { SecurityLogsModule } from 'src/security-logs/security-logs.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports:[TypeOrmModule.forFeature([User]), StaffModule, VolunteersModule, SecurityLogsModule]
})
export class UsersModule {}
