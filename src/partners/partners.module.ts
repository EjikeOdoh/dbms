import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Sponsorship } from 'src/sponsorship/entities/sponsorship.entity';
import { SecurityLogsModule } from 'src/security-logs/security-logs.module';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService],
  imports: [TypeOrmModule.forFeature([Partner, Sponsorship]), CloudinaryModule, SecurityLogsModule],
})
export class PartnersModule {}
