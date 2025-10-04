import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from 'src/participation/entities/participation.entity';
import { Student } from 'src/students/entities/student.entity';

@Module({
  controllers: [TagController],
  providers: [TagService],
  imports: [TypeOrmModule.forFeature([Participation, Student])],
})
export class TagModule {}
