import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import {
  CreateStudentDto,
  CreateStudentResponseDto,
  GetAllStudentsResponseDto,
  GetSearchResponseDto,
  StudentResponseDto,
  UpdateStudentApiDto,
} from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';
import { SecurityLogsService } from 'src/security-logs/security-logs.service';
import { AuditEvent } from 'src/security-logs/event-types';
import { AuditOutcome } from 'src/security-logs/entities/security-log.entity';

@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService, private readonly audit: SecurityLogsService) { }

  @Post()
  @ApiOperation({ summary: `Add new student` })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    type: CreateStudentResponseDto,
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while creating student`,
  })
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Roles(Role.Admin, Role.Editor)
  @Get()
  @ApiOperation({ summary: `Get paginated students records` })
  @ApiOkResponse({ type: GetAllStudentsResponseDto })
  @ApiInternalServerErrorResponse({
    example: `There was an error fetching students' records`,
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.studentsService.findAll(paginationDto);
  }

  @Delete()
  async removeAll() {
    return this.studentsService.removeAll();
  }

  @Get('schools')
  @ApiOperation({ summary: `Get all schools` })
  @ApiInternalServerErrorResponse({
    example: `There was an error fetching schools`,
  })
  async findSchools() {
    return this.studentsService.getAllSchools();
  }

  @Get('search')
  @ApiOperation({ summary: `Search for students by their names` })
  @ApiOkResponse({ type: GetSearchResponseDto })
  @ApiInternalServerErrorResponse({
    example: `There was an error searching for matching students`,
  })
  async search(@Query('name') name: string, @Query('school') school?: string) {
    return this.studentsService.findByNames(name, school);
  }

  @Get(':id')
  @ApiOperation({
    summary: `Get a student's profile, grades and participations`,
  })
  @ApiOkResponse({ type: StudentResponseDto })
  @ApiInternalServerErrorResponse({
    example: `Error fetching this student's details`,
  })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch('bulk')
  async bulkSchoolUpdate() {

    let ids = []

    const studentIds = ids.map(x => x.id);

    return this.studentsService.bulkUpdate(studentIds, "GSS Gwarinpa")
  }

  @Patch(':id')
  @ApiOperation({ summary: `Update student's profile` })
  @ApiBody({ type: UpdateStudentApiDto, required: false })
  @ApiOkResponse({ type: CreateStudentResponseDto })
  @ApiInternalServerErrorResponse({
    example: `An error occurred while updating this student record`,
  })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Request() req,
  ) {
    const before = await this.studentsService.findOne(+id);
    const updated = await this.studentsService.update(+id, updateStudentDto);
    const changedFields = Object.keys(updateStudentDto).filter(key => updateStudentDto[key] !== undefined);
    const sensitive = new Set(['address', 'phone', 'email', 'dob', 'fatherLastName', 'fatherFirstName', 'fatherPhone', 'fatherEducation', 'fatherJob', 'motherLastName', 'motherFirstName', 'motherPhone', 'motherEducation', 'motherJob']);
    const ordinary = changedFields.filter(key => !sensitive.has(key));
    const context = { actorUserId: String(req.user.sub), actorRoleAtTime: req.user.role, sessionId: req.user.sid, sourceIp: req.ip, userAgent: req.get('user-agent'), targetResourceType: 'student', targetResourceId: id };
    await this.audit.record({ eventType: AuditEvent.RecordUpdated, actionOutcome: AuditOutcome.Success, ...context, changedFields, valueDelta: { before: Object.fromEntries(ordinary.map(key => [key, before[key]])), after: Object.fromEntries(ordinary.map(key => [key, updated[key]])) } });
    const sensitiveChanged = changedFields.filter(key => sensitive.has(key));
    if (sensitiveChanged.length) await this.audit.record({ eventType: AuditEvent.SensitiveFieldUpdated, actionOutcome: AuditOutcome.Success, ...context, changedFields: sensitiveChanged });
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: `Delete student` })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiInternalServerErrorResponse({
    example: `An error occurred while deleting this student record`,
  })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
