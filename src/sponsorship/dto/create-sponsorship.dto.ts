import { ApiProperty, ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
}

export class CreateSponsorshipDto {
  @ApiProperty({example:2})
  @IsInt()
  @IsNotEmpty()
  partnerId: number;

  @ApiProperty({example: 1})
  @IsInt()
  @IsNotEmpty()
  programId: number;

  @ApiProperty({example: 2025})
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
    example:"10 Dell Inspiron 4560 laptops"
  })
  inKindDonation: string
}
