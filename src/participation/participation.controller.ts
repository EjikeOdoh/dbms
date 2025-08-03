import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { FilterDto } from './dto/filter.dto';

@Controller('participation')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) { }

  @Post()
  async create(@Body() createParticipationDto: CreateParticipationDto) {
    return this.participationService.create(createParticipationDto);
  }

  @Get()
  async findAll(@Query('year') year: number) {
    return await this.participationService.getStats(year);
  }

  @Get('filter')
  async filter(@Query() filterDto: FilterDto) {
    return this.participationService.findByOptions(filterDto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.participationService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateParticipationDto: UpdateParticipationDto) {
    return await this.participationService.update(+id, updateParticipationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.participationService.remove(+id);
  }
}
