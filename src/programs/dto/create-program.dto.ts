import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProgramType } from '../entities/program.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgramDto {
  @ApiProperty({
    example:ProgramType.ASCG,
    enum: ProgramType
  })
  @IsEnum(ProgramType)
  @IsNotEmpty()
  program: ProgramType;
}
