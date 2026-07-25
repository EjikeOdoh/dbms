import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesModule } from 'src/grades/grades.module';
import { Participation } from 'src/participation/entities/participation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { AcademicProgress, Grade } from 'src/grades/entities/grade.entity';
import { ParticipationModule } from 'src/participation/participation.module';
import { SecurityLogsModule } from 'src/security-logs/security-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Participation, Program, Grade, AcademicProgress]),
    GradesModule,
    ParticipationModule,
    SecurityLogsModule,
  ],
  exports: [StudentsService, TypeOrmModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
