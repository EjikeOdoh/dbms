import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateParticipationDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number; 

  @IsInt()
  @IsNotEmpty()
  programId: number; 

  @IsInt()
  @IsNotEmpty()
  year: number; 

  @IsInt()
  @IsNotEmpty()
  quarter: number;
}