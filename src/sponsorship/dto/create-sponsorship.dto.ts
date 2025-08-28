import { ApiProperty, ApiPropertyOptional, ApiResponse, PickType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Program } from 'src/enums/program.enum';
import { ProgramType } from 'src/programs/entities/program.entity';

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
}

export class CreateSponsorshipDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  partnerId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  programId: number;

  @ApiProperty({ example: 2025 })
  @IsInt()
  @IsNotEmpty()
  year: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    example: 'NGN',
    enum: Currency,
  })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiPropertyOptional({
    example: "10 Dell Inspiron 4560 laptops"
  })
  inKindDonation: string
}

export class CreateSponsorshipResponseDto extends CreateSponsorshipDto {
  @ApiProperty({ example: 1 })
  id: number
}


// {
//   "id": 1,
//   "amount": 100000,
//   "currency": null,
//   "year": 2025,
//   "donation": null,
//   "partner": "GSR",
//   "program": "ALL"
// },

export class GetAllSponsorshipDto extends PickType(CreateSponsorshipResponseDto, ['id', 'amount', 'currency', 'year']) {
  @ApiProperty({ example: "10 Dell Inspiron 4560 laptops" })
  donation: string

  @ApiProperty({ example: 'F5' })
  partner: string

  @ApiProperty({ example: ProgramType.ASCG, enum: ProgramType })
  program: ProgramType
}