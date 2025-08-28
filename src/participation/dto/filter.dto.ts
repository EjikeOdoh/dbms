import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ProgramType } from 'src/programs/entities/program.entity';

export class FilterDto {
  @ApiPropertyOptional({
    example: ProgramType.ASCG,
    enum: ProgramType
  })
  @IsEnum(ProgramType)
  @IsOptional()
  program?: ProgramType;

  @ApiPropertyOptional({
    example: 2025,
  })
  @IsInt()
  @IsOptional()
  year?: number;
}
