import { ApiProperty, ApiPropertyOptional, ApiResponse, OmitType, PickType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ProgramType } from 'src/programs/entities/program.entity';

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
  NULL = ""
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
  inkinddonation: string
}

export class CreateSponsorshipResponseDto extends CreateSponsorshipDto {
  @ApiProperty({ example: 1 })
  id: number
}


export class GetAllSponsorshipDto extends PickType(CreateSponsorshipResponseDto, ['id', 'amount', 'currency', 'year']) {
  @ApiProperty({ example: "10 Dell Inspiron 4560 laptops" })
  donation: string

  @ApiProperty({ example: 'F5' })
  partner: string

  @ApiProperty({ example: ProgramType.ASCG, enum: ProgramType })
  program: ProgramType
}

export class GetPartnerSponsorshipsDto extends OmitType(GetAllSponsorshipDto, ['partner']) { }