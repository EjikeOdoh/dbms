import { IsString, IsOptional, IsInt, Length } from 'class-validator';

export class CreateGradeDto {
  @IsInt()
  @IsOptional()
  studentId?: number;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  english?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  math?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  chemistry?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  physics?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  government?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  economics?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  biology?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  commerce?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  literature?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1)
  accounting?: string;

  @IsInt()
  @IsOptional()
  year?: number;
}