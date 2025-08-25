import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import { CreateSponsorshipDto } from './dto/create-sponsorship.dto';
import { UpdateSponsorshipDto } from './dto/update-sponsorship.dto';

@Controller('sponsorship')
export class SponsorshipController {
  constructor(private readonly sponsorshipService: SponsorshipService) {}

  @Post()
  create(@Body() createSponsorshipDto: CreateSponsorshipDto) {
    return this.sponsorshipService.create(createSponsorshipDto);
  }

  @Get()
  findAll() {
    return this.sponsorshipService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sponsorshipService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSponsorshipDto: UpdateSponsorshipDto) {
    return this.sponsorshipService.update(+id, updateSponsorshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sponsorshipService.remove(+id);
  }
}
