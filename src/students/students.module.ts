import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesModule } from 'src/grades/grades.module';
import { Participation } from 'src/participation/entities/participation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Grade } from 'src/grades/entities/grade.entity';
import { ParticipationModule } from 'src/participation/participation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Participation, Program, Grade]),
    GradesModule,
    ParticipationModule,
  ],
  exports: [StudentsService, TypeOrmModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
