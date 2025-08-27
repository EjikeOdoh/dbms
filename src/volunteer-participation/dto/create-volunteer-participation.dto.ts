import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

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
