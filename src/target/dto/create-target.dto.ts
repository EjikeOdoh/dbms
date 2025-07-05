import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateTargetDto {
    @IsNumber()
    @IsNotEmpty()
    target: number

    @IsNumber()
    @IsNotEmpty()
    year: number
}
