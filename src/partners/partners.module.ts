import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService],
  imports: [TypeOrmModule.forFeature([Partner]),CloudinaryModule]
})
export class PartnersModule {}
