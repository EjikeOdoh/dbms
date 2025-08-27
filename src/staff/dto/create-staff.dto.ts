import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsOptional()
  staffId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @IsString()
  @IsOptional()
  skillSet: string;

  @IsString()
  @IsOptional()
  cpName1: string;

  @IsString()
  @IsOptional()
  cpRel1: string;

  @IsString()
  @IsOptional()
  cpPhone1: string;

  @IsString()
  @IsOptional()
  cpName2: string;

  @IsString()
  @IsOptional()
  cpRel2: string;

  @IsString()
  @IsOptional()
  cpPhone2: string;
}
