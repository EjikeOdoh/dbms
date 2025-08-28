import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, CreateStaffResponseDto, GetAllStaffResponseDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({summary:`Add new staff`})
  @ApiBody({type: CreateStaffDto})
  @ApiOkResponse({type: CreateStaffResponseDto})
  @ApiConflictResponse({example:`This partner already exists.`})
  @ApiInternalServerErrorResponse({example:`An error occurred while creating this staff`})
  async create(@Body() createStaffDto: CreateStaffDto) {
    return await this.staffService.create(createStaffDto);
  }

  @Get()
  @ApiOperation({summary:`Get all staff`})
  @ApiOkResponse({type: [GetAllStaffResponseDto]})
  @ApiInternalServerErrorResponse({example:`An error occurred while fetching all staff`})
  async findAll() {
    return await this.staffService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:`Get a staff`})
  @ApiOkResponse({type: CreateStaffResponseDto})
  @ApiInternalServerErrorResponse({example:`Staff record was not found`})
  async findOne(@Param('id') id: string) {
    return await this.staffService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary:`Update staff`})
  @ApiBody({type: CreateStaffDto, required: false})
  @ApiOkResponse({type: CreateStaffResponseDto})
  @ApiInternalServerErrorResponse({example:`An error occurred while updating this staff record`})
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return await this.staffService.update(+id, updateStaffDto);
  }

  @Delete(':id')
  @ApiOperation({summary:`Delete staff`})
  @ApiOkResponse({type: DeleteResponseDto})
  @ApiInternalServerErrorResponse({example:`An error occurred while deleting this staff record`})
  async remove(@Param('id') id: string) {
    return await this.staffService.remove(+id);
  }
}
