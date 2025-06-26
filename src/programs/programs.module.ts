import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { StudentsService } from 'src/students/students.service';

@Module({
  controllers: [ProgramsController],
  providers: [ProgramsService],
  imports:[TypeOrmModule.forFeature([Program])],
  exports:[ProgramsService]
})
export class ProgramsModule {}
