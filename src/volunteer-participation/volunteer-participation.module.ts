import { Module } from '@nestjs/common';
import { VolunteerParticipationService } from './volunteer-participation.service';
import { VolunteerParticipationController } from './volunteer-participation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerParticipation } from './entities/volunteer-participation.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { Program } from 'src/programs/entities/program.entity';

@Module({
  controllers: [VolunteerParticipationController],
  providers: [VolunteerParticipationService],
  imports: [
    TypeOrmModule.forFeature([VolunteerParticipation, Volunteer, Program]),
  ],
  exports: [VolunteerParticipationService],
})
export class VolunteerParticipationModule {}
