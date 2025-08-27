import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ProgramType } from 'src/programs/entities/program.entity';

export class FilterDto {
  @IsEnum(ProgramType)
  @IsOptional()
  program?: ProgramType;

  @IsInt()
  @IsOptional()
  year?: number;
}
