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
import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';

export class CreateVolunteerDto {
  @ApiProperty({ example: "Jane" })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: "Doe" })
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

  @ApiPropertyOptional({
    example: '2025-02-15',
    description: `Only required if type is REGULAR`
  })
  @ValidateIf(o => o.type === VolunteerType.REGULAR)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2025-08-15',
    description: `Only required if type is REGULAR`
  })
  @ValidateIf(o => o.type === VolunteerType.REGULAR)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: '3 Atbara Street, Wuse 2' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'FCT-Abuja' })
  @IsString()
  @IsOptional()
  location: string;

  @ApiPropertyOptional({
    example: 1,
    description: `Only required if type is PROGRAM`
  })
  @ValidateIf(o => o.type === VolunteerType.PROGRAM)
  @IsOptional()
  programId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: `Only required if type is PROGRAM`
  })
  @ValidateIf(o => o.type === VolunteerType.PROGRAM)
  @IsOptional()
  quarter: number;

  @ApiPropertyOptional({
    example: 2025,
    description: `Only required if type is PROGRAM`

  })
  @ValidateIf(o => o.type === VolunteerType.PROGRAM)
  @IsOptional()
  year: number;

  @ApiPropertyOptional({
    example: false,
    description: `Only required if type is REGULAR`
  })
  @ValidateIf(o => o.type === VolunteerType.REGULAR)
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @ApiPropertyOptional({ example: "Data Collection, Photography" })
  @IsString()
  @IsOptional()
  skillSet?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: `Only required if type is REGULAR`
  })
  @IsString()
  @IsOptional()
  cpName1: string;

  @ApiPropertyOptional({
    example: "Father",
    description: `Only required if type is REGULAR`
  })
  @IsString()
  @IsOptional()
  cpRel1: string;

  @ApiPropertyOptional({
    example: "08020002000",
    description: `Only required if type is REGULAR`
  })
  @IsString()
  @IsOptional()
  cpPhone1: string;

  @ApiPropertyOptional({
    example: 'John',
    description: `Only required if type is REGULAR`
  })
  @IsString()
  @IsOptional()
  cpName2: string;

  @ApiPropertyOptional({
    example: 'Brother',
    description: `Only required if type is REGULAR`
  })
  @IsString()
  @IsOptional()
  cpRel2: string;

  @ApiPropertyOptional({
    example: '08030004000',
    description: `Only required if type is REGULAR`
  })
  @IsString()
  @IsOptional()
  cpPhone2: string;
}

export class CreateVolunteerResponseDto extends OmitType(CreateVolunteerDto, ['programId', 'quarter', 'year']) {
  @ApiProperty()
  id: number
}

export class UpdateVolunteerApiDto extends OmitType(CreateVolunteerResponseDto,['id']) {

}

export class GetAllVolunteerResponseDto extends PickType(CreateVolunteerResponseDto, ['id', 'firstName', 'lastName', 'type', 'active',]) { }

export class GetVolunteerResponseDto extends CreateVolunteerResponseDto {
  @ApiProperty()
  participations: any[]
}