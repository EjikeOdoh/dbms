import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateParticipationDto {
  @ApiProperty({ example: 445 })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  programId: number;

  @ApiProperty({ example: 2025 })
  @IsInt()
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  quarter: number;
}

export class CreatePartcicipationResponseDto extends CreateParticipationDto {
  @ApiProperty({ example: 3 })
  id: number;
}
