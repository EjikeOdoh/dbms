import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateProgramResponseDto } from 'src/programs/dto/create-program.dto';
import { CreateVolunteerResponseDto } from 'src/volunteers/dto/create-volunteer.dto';

export class CreateVolunteerParticipationDto {
  @ApiProperty({example:1})
  @IsInt()
  @IsNotEmpty()
  volunteerId: number;

  @ApiProperty({example:1})
  @IsInt()
  @IsNotEmpty()
  programId: number;

  @ApiProperty({example:2025})
  @IsInt()
  @IsNotEmpty()
  year: number;

  @ApiProperty({example:2})
  @IsInt()
  @IsNotEmpty()
  quarter: number;
}

export class CreateVolunteerParticipationResponseDto extends PickType(CreateVolunteerParticipationDto,['quarter','year']) {
  @ApiProperty()
  id: number

  @ApiProperty()
  volunteer:CreateVolunteerResponseDto

  @ApiProperty()
  program: CreateProgramResponseDto
}


export class GetVolunteerParticipationResponseDto extends PickType(CreateVolunteerParticipationResponseDto, ['id', 'quarter', 'year']) {}

export class UpdateVolunteerParticipationApiDto extends OmitType(CreateVolunteerParticipationDto,['programId','volunteerId']) {}