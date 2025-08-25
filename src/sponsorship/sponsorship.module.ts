import { Module } from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import { SponsorshipController } from './sponsorship.controller';

@Module({
  controllers: [SponsorshipController],
  providers: [SponsorshipService],
})
export class SponsorshipModule {}
