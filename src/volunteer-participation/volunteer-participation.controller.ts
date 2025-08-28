import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VolunteerParticipationService } from './volunteer-participation.service';
import { CreateVolunteerParticipationDto, CreateVolunteerParticipationResponseDto, GetVolunteerParticipationResponseDto, UpdateVolunteerParticipationApiDto } from './dto/create-volunteer-participation.dto';
import { UpdateVolunteerParticipationDto } from './dto/update-volunteer-participation.dto';
import { ApiBearerAuth, ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('volunteer-participation')
export class VolunteerParticipationController {
  constructor(
    private readonly volunteerParticipationService: VolunteerParticipationService,
  ) { }

  @Post()
  @ApiOperation({ summary: `Add Volunteer participation` })
  @ApiBody({ type: CreateVolunteerParticipationDto })
  @ApiResponse({
    status: 201,
    type: CreateVolunteerParticipationResponseDto
  })
  @ApiInternalServerErrorResponse({ example: `An unexpected error occurred while creating this record.` })
  async create(
    @Body() createVolunteerParticipationDto: CreateVolunteerParticipationDto,
  ) {
    return await this.volunteerParticipationService.create(
      createVolunteerParticipationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: `Get all volunteers' participations` })
  @ApiOkResponse({ type: [GetVolunteerParticipationResponseDto] })
  @ApiInternalServerErrorResponse({ example: `An unexpected error occurred while fetching all records.` })
  async findAll() {
    return await this.volunteerParticipationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: `Get volunteer participation` })
  @ApiOkResponse({ type: GetVolunteerParticipationResponseDto })
  @ApiInternalServerErrorResponse({ example: `An unexpected error occurred while fetching this record.` })
  async findOne(@Param('id') id: string) {
    return await this.volunteerParticipationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: `Update a record` })
  @ApiBody({ type: UpdateVolunteerParticipationApiDto })
  @ApiOkResponse({ type: GetVolunteerParticipationResponseDto })
  @ApiInternalServerErrorResponse({ example: `There was an error updating this record` })
  async update(
    @Param('id') id: string,
    @Body() updateVolunteerParticipationDto: UpdateVolunteerParticipationDto,
  ) {
    return await this.volunteerParticipationService.update(
      +id,
      updateVolunteerParticipationDto,
    );
  }


  @Delete(':id')
  @ApiOperation({ summary: `Delete record` })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiInternalServerErrorResponse({ example: `Error deleting this record` })
  async remove(@Param('id') id: string) {
    return await this.volunteerParticipationService.remove(+id);
  }
}
