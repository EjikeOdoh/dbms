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
import { CreateVolunteerDto, CreateVolunteerResponseDto, GetAllVolunteerResponseDto, GetVolunteerResponseDto, UpdateVolunteerApiDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';


@ApiBearerAuth('JWT-auth')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  @ApiOperation({summary:`Add volunteer`})
  @ApiBody({type: CreateVolunteerDto})
  @ApiOkResponse({type: CreateVolunteerResponseDto })
  @ApiConflictResponse({example:`This person already exists`})
  @ApiInternalServerErrorResponse({example:`An error occurred while creating this volunteer`})
  async create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return await this.volunteersService.create(createVolunteerDto);
  }

  @Get()
  @ApiOperation({summary:`Get All Volunteers`})
  @ApiOkResponse({type:[GetAllVolunteerResponseDto]})
  @ApiInternalServerErrorResponse({example:`An error occurred while getting volunteers`})
  async findAll() {
    return await this.volunteersService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:`Get Volunteer`})
  @ApiOkResponse({type:GetVolunteerResponseDto})
  @ApiInternalServerErrorResponse({example:`An error occurred while getting this volunteer`})
  async findOne(@Param('id') id: string) {
    return await this.volunteersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary:`Update volunteer`})
  @ApiBody({type: UpdateVolunteerApiDto, required: false})
  @ApiOkResponse({type: GetVolunteerResponseDto })
  @ApiInternalServerErrorResponse({example:`An error occurred while updating this volunteer`})
  async update(
    @Param('id') id: string,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    return await this.volunteersService.update(+id, updateVolunteerDto);
  }

  @Delete(':id')
  @ApiOperation({summary:`Delete Volunteer`})
  @ApiOkResponse({type: DeleteResponseDto})
  @ApiInternalServerErrorResponse({example:`An error occurred while deleting this volunteer record`})
  async remove(@Param('id') id: string) {
    return await this.volunteersService.remove(+id);
  }
}
