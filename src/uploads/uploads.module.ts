import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { StudentsModule } from 'src/students/students.module';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  imports: [StudentsModule]
})
export class UploadsModule {}
