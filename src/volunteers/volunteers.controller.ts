import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';

@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  async create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return await this.volunteersService.create(createVolunteerDto);
  }

  @Get()
  async findAll() {
    return await this.volunteersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.volunteersService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    return await this.volunteersService.update(+id, updateVolunteerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.volunteersService.remove(+id);
  }
}
