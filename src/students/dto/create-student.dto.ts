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
import { CreateGradeDto } from '../../grades/dto/create-grade.dto';
import { ProgramType } from 'src/programs/entities/program.entity';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  school: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 5)
  currentClass: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  lastName: string;

  @IsDate()
  @IsNotEmpty()
  dob: Date;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  address?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  country: string;

  @IsString()
  @IsOptional()
  @Length(1, 13)
  phone?: string;

  @IsString()
  @IsOptional()
  @Length(1, 30)
  email?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherLastName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherFirstName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 13)
  fatherPhone?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherEducation?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  fatherJob?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherLastName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherFirstName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 13)
  motherPhone?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherEducation?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  motherJob?: string;

  @IsNumber()
  @IsOptional()
  noOfSisters?: number;

  @IsNumber()
  @IsOptional()
  noOfBrothers?: number;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  position?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  focus?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  favSubject?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  difficultSubject?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  careerChoice1?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  careerChoice2?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateGradeDto)
  @IsOptional()
  grades?: CreateGradeDto;

  @IsEnum(ProgramType)
  @IsNotEmpty()
  program: ProgramType;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsInt()
  @IsNotEmpty()
  quarter: number;
}
