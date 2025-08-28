import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { CreatePartcicipationResponseDto, CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { FilterDto } from './dto/filter.dto';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DeleteResponseDto, StatsResponseDto } from 'src/common.dto';
import { FilterStudentsResponseDto } from 'src/students/dto/create-student.dto';

@ApiBearerAuth('JWT-auth')
@Controller('participation')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) { }

  @Post()
  @ApiOperation({
    summary: `Create a student's participation`
  })
  @ApiBody({ type: CreateParticipationDto })
  @ApiOkResponse({
    type: CreatePartcicipationResponseDto
  })
  @ApiConflictResponse({
    example: `This record already exists!`
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while creating this record.`
  })
  async create(@Body() createParticipationDto: CreateParticipationDto) {
    return this.participationService.create(createParticipationDto);
  }


  @Get()
  @ApiOperation({ summary: `Getting stats` })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: false
  })
  @ApiOkResponse({
    type: StatsResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching all stats.`
  })
  async findAll(@Query('year') year: number) {
    return await this.participationService.getStats(year);
  }

  @Get('filter')
  @ApiOperation({ summary: `Getting filtered stats` })
  @ApiOkResponse({
    type: [FilterStudentsResponseDto]
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching all stats.`
  })
  async filter(@Query() filterDto: FilterDto) {
    return this.participationService.findByOptions(filterDto);
  }


  @Get(':id')
  @Get(':id')
  @ApiOperation({ summary: `Get a record` })
  @ApiOkResponse({
    type: CreatePartcicipationResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching this record.`
  })
  async findOne(@Param('id') id: string) {
    return await this.participationService.findOne(+id);
  }


  @Patch(':id')
   @ApiOperation({ summary: `Update a record` })
    @ApiBody({ type: CreateParticipationDto })
    @ApiParam({
      name:"id",
      type: Number
    })
    @ApiOkResponse({
      type: CreatePartcicipationResponseDto
    })
    @ApiInternalServerErrorResponse({
      example: `An unexpected error occurred while updating this record.`
    })
  async update(
    @Param('id') id: string,
    @Body() updateParticipationDto: UpdateParticipationDto,
  ) {
    return await this.participationService.update(+id, updateParticipationDto);
  }


  @Delete(':id')
    @ApiOperation({ summary: `Delete a record` })
    @ApiOkResponse({
      type: DeleteResponseDto
    })
    @ApiInternalServerErrorResponse({
      example: `An unexpected error occurred while deleting this record`
    })
  async remove(@Param('id') id: string) {
    return await this.participationService.remove(+id);
  }
}
