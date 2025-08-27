import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { VolunteerType } from '../entities/volunteer.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVolunteerDto {
  @ApiProperty({example:"Jane"})
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({example:"Doe"})
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: VolunteerType.PROGRAM,
    enum: VolunteerType
  })
  @IsNotEmpty()
  @IsEnum(VolunteerType)
  type: VolunteerType;

  @ApiPropertyOptional({example:'2025-02-15'})
  @ValidateIf(o => o.type === VolunteerType.REGULAR)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({example:'2025-08-15'})
  @ValidateIf(o => o.type === VolunteerType.REGULAR)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({example:'3 Atbara Street, Wuse 2'})
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({example:'FCT-Abuja'})
  @IsString()
  @IsOptional()
  location: string;

  @ApiPropertyOptional({example:1})
  @ValidateIf(o => o.type === VolunteerType.PROGRAM)
  @IsOptional()
  programId?: number;

  @ApiPropertyOptional({example:1})
  @ValidateIf(o => o.type === VolunteerType.PROGRAM)
  @IsOptional()
  quarter: number;

  @ApiPropertyOptional({example:2025})
  @ValidateIf(o => o.type === VolunteerType.PROGRAM)
  @IsOptional()
  year: number;

  @ApiPropertyOptional({example:false})
  @ValidateIf(o => o.type === VolunteerType.REGULAR)
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @ApiPropertyOptional({example:"Data Collection, Photography"})
  @IsString()
  @IsOptional()
  skillSet?: string;

  @ApiPropertyOptional({example: 'Doe'})
  @IsString()
  @IsOptional()
  cpName1: string;

  @ApiPropertyOptional({example:"Father"})
  @IsString()
  @IsOptional()
  cpRel1: string;

  @ApiPropertyOptional({example:"08020002000"})
  @IsString()
  @IsOptional()
  cpPhone1: string;

  @ApiPropertyOptional({example: 'John'})
  @IsString()
  @IsOptional()
  cpName2: string;

  @ApiPropertyOptional({example: 'Brother'})
  @IsString()
  @IsOptional()
  cpRel2: string;

  @ApiPropertyOptional({example: '08030004000'})
  @IsString()
  @IsOptional()
  cpPhone2: string;
}
