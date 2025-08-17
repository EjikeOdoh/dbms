import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    return await this.staffService.create(createStaffDto);
  }

  @Get()
  async findAll() {
    return await this.staffService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.staffService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return await this.staffService.update(+id, updateStaffDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.staffService.remove(+id);
  }
}
