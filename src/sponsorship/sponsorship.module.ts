import { Module } from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import { SponsorshipController } from './sponsorship.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sponsorship } from './entities/sponsorship.entity';
import { Partner } from 'src/partners/entities/partner.entity';
import { Program } from 'src/programs/entities/program.entity';

@Module({
  controllers: [SponsorshipController],
  providers: [SponsorshipService],
  imports:[TypeOrmModule.forFeature([Sponsorship, Partner, Program])]
})
export class SponsorshipModule {}
