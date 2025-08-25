import { IsInt, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateSponsorshipDto {
    @IsInt()
    @IsNotEmpty()
    partnerId: number;

    @IsInt()
    @IsNotEmpty()
    programId: number;

    @IsInt()
    @IsNotEmpty()
    year: number;

    @IsNumber()
    @IsOptional()
    amount: number
}
