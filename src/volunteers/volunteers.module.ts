import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { VolunteerParticipation } from 'src/volunteer-participation/entities/volunteer-participation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { VolunteerParticipationModule } from 'src/volunteer-participation/volunteer-participation.module';

@Module({
  controllers: [VolunteersController],
  providers: [VolunteersService],
  imports: [
    TypeOrmModule.forFeature([Volunteer, VolunteerParticipation, Program]),
    VolunteerParticipationModule,
  ],
  exports: [VolunteersService]
})
export class VolunteersModule { }
