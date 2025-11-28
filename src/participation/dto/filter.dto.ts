import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ProgramType } from 'src/programs/entities/program.entity';

export class FilterDto {
  @ApiPropertyOptional({
    example: ProgramType.ASCG,
    enum: ProgramType,
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


export class FilterByCountryDto {
  country?: string
  year?: number
  
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  limit?: number = 10;
}


export class ParticipationReportDto {
  id: number;
  firstName: string
  lastName: string
  dob: string
  country: string
  program: string
  quarter: string
  year: number
}

export type AgeRangeSummary = {
  range: string;
  count: number;
};


export type ProgramBreakdownGrouped = {
  year: number | null,
  ageGroup: AgeRangeSummary[]
  programs: {
    [program: string]: {
      quarter: number
      count: number
    }[];
  };
};
