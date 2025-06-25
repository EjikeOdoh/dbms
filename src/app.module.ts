import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { ProgramsModule } from './programs/programs.module';
import { GradesModule } from './grades/grades.module';
import { ParticipationModule } from './participation/participation.module';

@Module({
  imports: [StudentsModule, ProgramsModule, GradesModule, ParticipationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
