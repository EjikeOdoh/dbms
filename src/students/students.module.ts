import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesModule } from 'src/grades/grades.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), GradesModule],
  exports:[StudentsService, TypeOrmModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {
}
