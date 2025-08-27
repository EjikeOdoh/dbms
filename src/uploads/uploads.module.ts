import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { StudentsModule } from 'src/students/students.module';
import { ParticipationModule } from 'src/participation/participation.module';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  imports: [StudentsModule, ParticipationModule],
})
export class UploadsModule {}
