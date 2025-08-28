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
import { StudentsService } from './students.service';
import { CreateStudentDto, CreateStudentResponseDto, GetAllStudentsResponseDto, GetSearchResponseDto, StudentResponseDto, UpdateStudentApiDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum.';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({summary:`Add new student`})
  @ApiBody({type: CreateStudentDto})
  @ApiResponse({
    status: 201,
    type: CreateStudentResponseDto
  })
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while creating student`})
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Roles(Role.Admin, Role.Editor)
  @Get()
  @ApiOperation({ summary: `Get paginated students records` })
  @ApiOkResponse({ type: GetAllStudentsResponseDto })
  @ApiInternalServerErrorResponse({ example: `There was an error fetching students' records` })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.studentsService.findAll(paginationDto);
  }

  
  @Delete()
  async removeAll() {
    return this.studentsService.removeAll();
  }

  @Get('search')
  @ApiOperation({summary:`Search for students by their names`})
  @ApiOkResponse({type: GetSearchResponseDto})
  @ApiInternalServerErrorResponse({example:`There was an error searching for matching students`})
  async search(@Query('name') name: string) {
    return this.studentsService.findByNames(name);
  }

  @Get(':id')
  @ApiOperation({summary:`Get a student's profile, grades and participations`})
  @ApiOkResponse({type: StudentResponseDto})
  @ApiInternalServerErrorResponse({example:`Error fetching this student's details`})
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary:`Update student's profile`})
  @ApiBody({type: UpdateStudentApiDto, required: false})
  @ApiOkResponse({type:CreateStudentResponseDto})
  @ApiInternalServerErrorResponse({example:`An error occurred while updating this student record`})
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({summary:`Delete student`})
  @ApiOkResponse({type: DeleteResponseDto})
  @ApiInternalServerErrorResponse({example:`An error occurred while deleting this student record`})
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
