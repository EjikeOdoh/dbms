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

@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

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

    let ids = [{
  "id": 27024
}, {
  "id": 27029
}, {
  "id": 27048
}, {
  "id": 27026
}, {
  "id": 27041
}, {
  "id": 27052
}, {
  "id": 27022
}, {
  "id": 27030
}, {
  "id": 27050
}, {
  "id": 27017
}, {
  "id": 27043
}, {
  "id": 27028
}, {
  "id": 27047
}, {
  "id": 27015
}, {
  "id": 27020
}, {
  "id": 27044
}, {
  "id": 27051
}, {
  "id": 27046
}, {
  "id": 36176
}, {
  "id": 36178
}, {
  "id": 36175
}, {
  "id": 36177
}, {
  "id": 27027
}, {
  "id": 27045
}, {
  "id": 27053
}, {
  "id": 31940
}, {
  "id": 30522
}, {
  "id": 30526
}, {
  "id": 30525
}, {
  "id": 30521
}, {
  "id": 30529
}, {
  "id": 30524
}, {
  "id": 30574
}, {
  "id": 30530
}, {
  "id": 30523
}, {
  "id": 30527
}, {
  "id": 30531
}, {
  "id": 30932
}, {
  "id": 30938
}, {
  "id": 30946
}, {
  "id": 30952
}, {
  "id": 30959
}, {
  "id": 30935
}, {
  "id": 30945
}, {
  "id": 30953
}, {
  "id": 30933
}, {
  "id": 30939
}, {
  "id": 30966
}, {
  "id": 30941
}, {
  "id": 30948
}, {
  "id": 30963
}, {
  "id": 30947
}, {
  "id": 30954
}, {
  "id": 30965
}, {
  "id": 30934
}, {
  "id": 30942
}, {
  "id": 30950
}, {
  "id": 30961
}, {
  "id": 30937
}, {
  "id": 30944
}, {
  "id": 30956
}, {
  "id": 30962
}, {
  "id": 30931
}, {
  "id": 30940
}, {
  "id": 30951
}, {
  "id": 30958
}, {
  "id": 30964
}, {
  "id": 30936
}, {
  "id": 30943
}, {
  "id": 30949
}, {
  "id": 33450
}, {
  "id": 33658
}, {
  "id": 36366
}, {
  "id": 36368
}, {
  "id": 36370
}, {
  "id": 36367
}, {
  "id": 36369
}, {
  "id": 36371
}, {
  "id": 33678
}, {
  "id": 36571
}, {
  "id": 34546
}, {
  "id": 34556
}, {
  "id": 34575
}, {
  "id": 34582
}, {
  "id": 34577
}, {
  "id": 34549
}, {
  "id": 34557
}, {
  "id": 34563
}, {
  "id": 34571
}, {
  "id": 34558
}, {
  "id": 34564
}, {
  "id": 34573
}, {
  "id": 34579
}, {
  "id": 34608
}, {
  "id": 34576
}, {
  "id": 34584
}, {
  "id": 34553
}, {
  "id": 34559
}, {
  "id": 34565
}, {
  "id": 34572
}, {
  "id": 34583
}, {
  "id": 34554
}, {
  "id": 34562
}, {
  "id": 34569
}, {
  "id": 34551
}, {
  "id": 34560
}, {
  "id": 34566
}, {
  "id": 34574
}, {
  "id": 34581
}, {
  "id": 34590
}, {
  "id": 34550
}, {
  "id": 34570
}, {
  "id": 34580
}, {
  "id": 34555
}, {
  "id": 34561
}, {
  "id": 34568
}, {
  "id": 34578
}, {
  "id": 34990
}, {
  "id": 34998
}, {
  "id": 34993
}, {
  "id": 34991
}, {
  "id": 34996
}, {
  "id": 34999
}, {
  "id": 34995
}, {
  "id": 35002
}, {
  "id": 34994
}, {
  "id": 34992
}, {
  "id": 34997
}, {
  "id": 14762
}, {
  "id": 14773
}, {
  "id": 14781
}, {
  "id": 14769
}, {
  "id": 14784
}, {
  "id": 14794
}, {
  "id": 14757
}, {
  "id": 14765
}, {
  "id": 14774
}, {
  "id": 14783
}, {
  "id": 14767
}, {
  "id": 14782
}, {
  "id": 14775
}, {
  "id": 14789
}, {
  "id": 14758
}, {
  "id": 14768
}, {
  "id": 14778
}, {
  "id": 14756
}, {
  "id": 14772
}, {
  "id": 14780
}, {
  "id": 14787
}, {
  "id": 14760
}, {
  "id": 14770
}, {
  "id": 14776
}, {
  "id": 14785
}, {
  "id": 14763
}, {
  "id": 14779
}, {
  "id": 14761
}, {
  "id": 14771
}, {
  "id": 14777
}, {
  "id": 14786
}]

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
  ) {
    return this.studentsService.update(+id, updateStudentDto);
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
