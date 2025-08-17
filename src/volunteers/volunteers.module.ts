import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';

@Module({
  controllers: [VolunteersController],
  providers: [VolunteersService],
  imports:[TypeOrmModule.forFeature([Volunteer])]
})
export class VolunteersModule {}
