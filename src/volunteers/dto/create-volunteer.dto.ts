import { IsArray, IsBoolean, IsDate, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { VolunteerType } from "../entities/volunteer.entity";
import { ProgramType } from "src/programs/entities/program.entity";

export class CreateVolunteerDto {
    
        @IsString()
        @MinLength(2)
        @MaxLength(50)
        firstName: string;
    
        @IsString()
        @MinLength(2)
        @MaxLength(50)
        lastName: string;

        @IsEnum(VolunteerType)
        type: VolunteerType;
    
        @IsDate()
        @IsOptional()
        startDate?: Date;
    
        @IsDate()
        @IsOptional()
        endDate?: Date;
    
        @IsString()
        @IsOptional()
        address?: string;
    
        @IsString()
        @IsOptional()
        location: string;
    
        @IsOptional()
        program?: ProgramType;

        @IsOptional()
        quarter: number

        @IsOptional()
        year: number
    
        @IsBoolean()
        @IsOptional()
        active?: boolean = true;
    
        @IsString()
        @IsOptional()
        skillSet?: string
    
        @IsString()
        @IsOptional()
        cpName1: string
    
    
        @IsString()
        @IsOptional()
        cpRel1: string
    
    
        @IsString()
        @IsOptional()
        cpPhone1: string
    
        @IsString()
        @IsOptional()
        cpName2: string
    
        @IsString()
        @IsOptional()
        cpRel2: string
    
        @IsString()
        @IsOptional()
        cpPhone2: string
}


export class ResponseAfterUpdate extends CreateVolunteerDto {
        @IsArray()
        participation: []
}