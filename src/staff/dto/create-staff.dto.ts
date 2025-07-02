import { IsString, IsNumber, IsBoolean, IsOptional, IsDate, MinLength, MaxLength } from 'class-validator';

export class CreateStaffDto {
    @IsString()
    @IsOptional()
    staffId?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @IsDate()
    @IsOptional()
    dob?: Date;

    @IsString()
    @IsOptional()
    address?: string;

    @IsNumber()
    yearJoined: number;

    @IsString()
    @IsOptional()
    role?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}
