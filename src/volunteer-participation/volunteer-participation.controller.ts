import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VolunteerParticipationService } from './volunteer-participation.service';
import { CreateVolunteerParticipationDto } from './dto/create-volunteer-participation.dto';
import { UpdateVolunteerParticipationDto } from './dto/update-volunteer-participation.dto';

@Controller('volunteer-participation')
export class VolunteerParticipationController {
  constructor(private readonly volunteerParticipationService: VolunteerParticipationService) { }

  @Post()
  async create(@Body() createVolunteerParticipationDto: CreateVolunteerParticipationDto) {
    return await this.volunteerParticipationService.create(createVolunteerParticipationDto);
  }

  @Get()
  async findAll() {
    return await this.volunteerParticipationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.volunteerParticipationService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVolunteerParticipationDto: UpdateVolunteerParticipationDto) {
    return await this.volunteerParticipationService.update(+id, updateVolunteerParticipationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.volunteerParticipationService.remove(+id);
  }
}
