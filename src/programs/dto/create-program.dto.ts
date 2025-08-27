import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProgramType } from '../entities/program.entity';

export class CreateProgramDto {
  @IsEnum(ProgramType)
  @IsNotEmpty()
  program: ProgramType;
}
