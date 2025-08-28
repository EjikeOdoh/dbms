import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumber,
  Length,
  ValidateNested,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGradeDto, GetStudentGradesResponseDto, GradeDto } from '../../grades/dto/create-grade.dto';
import { ProgramType } from 'src/programs/entities/program.entity';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    example: 'GSS Kagini',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  school: string;

  @ApiProperty({
    example: 'SS2',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 5)
  currentClass: string;

  @ApiProperty({
    example: 'Precious',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  firstName: string;

  @ApiProperty({
    example: 'Isa',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  lastName: string;

  @ApiProperty({
    example: '2010-10-10',
  })
  @IsDate()
  @IsNotEmpty()
  dob: Date;

  @ApiProperty({
    example: 'Behind Chief Palace, Kagini',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  address?: string;

  @ApiProperty({
    example: 'Nigeria',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  country: string;

  @ApiProperty({
    example: '08010002000',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 13)
  phone?: string;

  @ApiProperty({
    example: 'preciousisa@email.com',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 30)
  email?: string;

  @ApiProperty({
    example: 'Matthew',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherLastName?: string;

  @ApiProperty({
    example: 'Isa',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherFirstName?: string;

  @ApiProperty({
    example: '08130001000',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 13)
  fatherPhone?: string;

  @ApiProperty({
    example: 'BSC',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherEducation?: string;

  @ApiProperty({
    example: 'Civil Servant',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherJob?: string;

  @ApiProperty({
    example: 'Isa',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherLastName?: string;

  @ApiProperty({
    example: 'Margaret',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherFirstName?: string;

  @ApiProperty({
    example: '09010002000',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 13)
  motherPhone?: string;

  @ApiProperty({
    example: 'SSCE',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherEducation?: string;

  @ApiProperty({
    example: 'Businesswoman',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherJob?: string;

  @ApiProperty({
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  noOfSisters?: number;

  @ApiProperty({
    example: 2,
    required: false
  })
  @IsNumber()
  @IsOptional()
  noOfBrothers?: number;

  @ApiProperty({
    example: 'Second',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  position?: string;

  @ApiProperty({
    example: 'Science',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  focus?: string;

  @ApiProperty({
    example: 'Biology',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  favSubject?: string;

  @ApiProperty({
    example: 'Further Maths',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  difficultSubject?: string;

  @ApiProperty({
    example: 'Neurosurgeon',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  careerChoice1?: string;

  @ApiProperty({
    example: 'Pharmacist',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  careerChoice2?: string;

  @ApiProperty({
    type: () => GradeDto,
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateGradeDto)
  @IsOptional()
  grades?: CreateGradeDto;

  @ApiProperty({
    example: ProgramType.ASCG,
    required: false,
    enum: ProgramType
  })
  @IsEnum(ProgramType)
  @IsNotEmpty()
  program: ProgramType;

  @ApiProperty({
    required: true,
    example: 2025
  })
  @IsInt()
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    required: true,
    example: 2
  })
  @IsInt()
  @IsNotEmpty()
  quarter: number;
}


export class FilterStudentsResponseDto extends PickType(CreateStudentDto, ['firstName', 'lastName', 'dob', 'country']) {
  @ApiProperty({ example: 1 })
  participationId: number

  @ApiProperty({ example: 1 })
  studentId: number

  @ApiProperty({ example: 2025 })
  year: number

  @ApiProperty({ example: ProgramType.ASCG, enum: ProgramType })
  program: ProgramType
}

export class CreateStudentResponseDto extends OmitType(CreateStudentDto, ['grades', 'program', 'quarter', 'year']) {
  @ApiProperty()
  id: number

  @ApiProperty({ example: 2023 })
  yearJoined: number
}

export class UpdateStudentApiDto extends OmitType(CreateStudentResponseDto,['id']) {}

export class PaginationMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ nullable: true })
  nextPage: number | null;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

export class GetStudentsResponseDto extends PickType(CreateStudentResponseDto, ['id', 'firstName', 'lastName', 'dob', 'school', 'country', 'yearJoined']) {
}

export class GetAllStudentsResponseDto {
  @ApiProperty({ type: () => [GetStudentsResponseDto] })
  data: GetStudentsResponseDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class GetSearchResponseDto {
  @ApiProperty({ type: () => [GetStudentsResponseDto] })
  students: GetStudentsResponseDto[];

  @ApiProperty()
  count: number
}

export class ParticipationResponseDto {
  @ApiProperty({ example: 402 })
  participation_id: number;

  @ApiProperty({ example: 2025 })
  participation_year: number;

  @ApiProperty({ example: 2 })
  participation_quarter: number;

  @ApiProperty({ example: ProgramType.ASCG, enum: ProgramType })
  program_program: ProgramType;
}

export class StudentResponseDto extends CreateStudentResponseDto {
  @ApiProperty({ type: () => [GetStudentGradesResponseDto] })
  grades: GetStudentGradesResponseDto[]

  @ApiProperty({ type: () => [ParticipationResponseDto] })
  participations: ParticipationResponseDto[]

}