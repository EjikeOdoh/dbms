import { IsInt, IsNotEmpty } from "class-validator";

export class CreateVolunteerParticipationDto {
      @IsInt()
      @IsNotEmpty()
      volunteerId: number; 
    
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
