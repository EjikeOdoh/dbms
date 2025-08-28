import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto, CreateGradesResponseDto, GetAllGradesResponseDto, GetStudentGradesResponseDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) { }

  @Post()
  @ApiOperation({
    summary: `Create student's result`
  })
  @ApiBody({ type: CreateGradeDto })
  @ApiOkResponse({
    type: CreateGradesResponseDto
  })
  @ApiConflictResponse({
    example: `A grade for this student and year already exists.`
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while creating the grade.`
  })
  async create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }


  @Get()
  @ApiOperation({ summary: `Get all students' grades` })
  @ApiOkResponse({
    type: GetAllGradesResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching all students' grades.`
  })
  async findAll() {
    return this.gradesService.findAll();
  }



  @Get(':id')
  @ApiOperation({ summary: `Get a student's grades` })
  @ApiOkResponse({
    type: GetStudentGradesResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching this student's grades.`
  })
  async findOne(@Param('id') id: string) {
    return this.gradesService.findOne(+id);
  }


  @Patch(':id')
  @ApiOperation({ summary: `Update a student's grades` })
  @ApiOkResponse({
    type: CreateGradesResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while updating student's grades.`
  })
  async update(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.gradesService.update(+id, updateGradeDto);
  }


  @Delete(':id')
  @ApiOperation({ summary: `Delete a student's grades` })
  @ApiOkResponse({
    type: DeleteResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while deleting student's grades.`
  })
  async remove(@Param('id') id: string) {
    return this.gradesService.remove(+id);
  }
}
