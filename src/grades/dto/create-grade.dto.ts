import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Length, IsNotEmpty } from 'class-validator';

export class GradeDto {
  @ApiPropertyOptional({
    example: 'B'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  english?: string;

  @ApiPropertyOptional({
    example: 'C'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  math?: string;

  @ApiPropertyOptional({
    example: 'B'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  chemistry?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  physics?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  government?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  economics?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  biology?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  commerce?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  literature?: string;

  @ApiPropertyOptional({
    example: 'A'
  })
  @IsString()
  @IsOptional()
  @Length(1, 1)
  accounting?: string;

}

export class CreateGradeDto extends GradeDto {
  @ApiProperty({
    example:445
  })
  @IsInt()
  @IsNotEmpty()
  studentId?: number;

  @ApiProperty({example: 2025})
  @IsInt()
  @IsOptional()
  year?: number;
}

export class CreateGradesResponseDto extends CreateGradeDto {
  @ApiProperty({example:1})
  id: number
}

export class GetStudentGradesResponseDto extends OmitType(CreateGradeDto, ['studentId']) {}

 export class GetAllGradesResponseDto {
  @ApiProperty()
  studentId: number;

  @ApiProperty()
  school: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ type: [GetStudentGradesResponseDto] })
  grades: GetStudentGradesResponseDto[];
}