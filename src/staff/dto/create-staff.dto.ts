import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDate,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateStaffDto {
  @ApiPropertyOptional({ example: 'I4500' })
  @IsString()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({ example: '2021-07-07' })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2024-07-07' })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: '3 Atbara Str, Wuse 2' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'FCT-Abuja' })
  @IsString()
  @IsOptional()
  location: string;

  @ApiPropertyOptional({ example: 'Instructor' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @ApiPropertyOptional({ example: 'Robotics, Software Development' })
  @IsString()
  @IsOptional()
  skillSet: string;

  @ApiPropertyOptional({ example: 'Jane' })
  @IsString()
  @IsOptional()
  cpName1: string;

  @ApiPropertyOptional({ example: 'Sister' })
  @IsString()
  @IsOptional()
  cpRel1: string;

  @ApiPropertyOptional({ example: '08010002000' })
  @IsString()
  @IsOptional()
  cpPhone1: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  cpName2: string;

  @ApiPropertyOptional({ example: 'Father' })
  @IsString()
  @IsOptional()
  cpRel2: string;

  @ApiPropertyOptional({ example: '08020002000' })
  @IsString()
  @IsOptional()
  cpPhone2: string;
}

export class CreateStaffResponseDto extends CreateStaffDto {
  @ApiProperty({ example: 1 })
  id: number;
}

export class GetAllStaffResponseDto extends PickType(CreateStaffResponseDto, [
  'id',
  'staffId',
  'firstName',
  'lastName',
  'role',
  'active',
]) {}
