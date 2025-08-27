import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from 'src/students/entities/student.entity';

@Module({
  controllers: [GradesController],
  providers: [GradesService],
  imports: [TypeOrmModule.forFeature([Grade, Student])],
  exports: [GradesService],
})
export class GradesModule {}
