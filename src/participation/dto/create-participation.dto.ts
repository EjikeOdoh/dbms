import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

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

  @ApiPropertyOptional({
    example: '2025 CBC 2',
  })
  @IsOptional()
  tag: string | null;
}

export class CreatePartcicipationResponseDto extends CreateParticipationDto {
  @ApiProperty({ example: 3 })
  id: number;
}
