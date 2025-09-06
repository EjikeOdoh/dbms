import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTargetDto {
  @ApiProperty({ example: 6000 })
  @IsNumber()
  @IsNotEmpty()
  target: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  @IsNotEmpty()
  year: number;
}

export class CreateTargetResponseDto extends CreateTargetDto {
  @ApiProperty({ example: 1 })
  id: number;
}
