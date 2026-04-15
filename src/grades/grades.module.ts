import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicProgress, Grade, GradeAverage } from './entities/grade.entity';
import { Student } from 'src/students/entities/student.entity';
import { ParticipationModule } from 'src/participation/participation.module';

@Module({
  controllers: [GradesController],
  providers: [GradesService],
  imports: [TypeOrmModule.forFeature([Grade, Student, GradeAverage, AcademicProgress]), ParticipationModule],
  exports: [GradesService],
})
export class GradesModule {}
