import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreatePartnerDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    desc?: string

    @IsString()
    @IsOptional()
    twitter?: string

    @IsString()
    @IsOptional()
    linkedIn?: string

    @IsNumber()
    @IsOptional()
    date?: number

    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @IsString()
    @IsOptional()
    logoUrl?: string

    @IsString()
    @IsOptional()
    logoPublicId?: string
}
