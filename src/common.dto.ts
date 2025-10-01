import { ApiProperty } from '@nestjs/swagger';

export class DeleteResponseDto {
  @ApiProperty({ example: true })
  deleted: boolean;
}

export class CountByCountryDto {
  @ApiProperty()
  country: string;

  @ApiProperty()
  count: number;
}

export class CountByProgramDto {
  @ApiProperty()
  program: string;

  @ApiProperty()
  count: number;
}

export class CountByYearDto {
  @ApiProperty()
  year: number;

  @ApiProperty()
  count: number;
}

export class TotalCountByCountryDto {
  @ApiProperty()
  country: string;

  @ApiProperty()
  total: number;
}

export class StatsResponseDto {
  @ApiProperty({ type: String, description: 'Year can be a number or string' })
  year: string | number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ type: [CountByCountryDto] })
  countByCountry: CountByCountryDto[];

  @ApiProperty({ type: [CountByProgramDto] })
  countByProgram: CountByProgramDto[];

  @ApiProperty()
  uniqueCount: number;

  @ApiProperty({ type: [CountByYearDto] })
  countByYear: CountByYearDto[];

  @ApiProperty({ type: [TotalCountByCountryDto] })
  totalCountByCountry: TotalCountByCountryDto[];

  @ApiProperty()
  target: number;

  @ApiProperty()
  highestYearlyCount: number;
}
