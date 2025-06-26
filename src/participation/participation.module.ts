import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './entities/participation.entity';
import { Student } from 'src/students/entities/student.entity';
import { Program } from 'src/programs/entities/program.entity';


@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService],
  imports: [TypeOrmModule.forFeature([Participation, Student, Program])],
  exports:[ParticipationService]
})
export class ParticipationModule {}
