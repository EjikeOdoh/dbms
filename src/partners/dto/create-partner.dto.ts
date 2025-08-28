import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: 'F5' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "F5 is a multi-cloud application security and delivery company that helps organizations create, secure, and operate applications by providing solutions for web application and API protection, multicloud networking, and zero trust security. Their technologies are used by large enterprises, financial institutions, and governments to protect against cyber threats and deliver reliable digital experiences across data centers and cloud environments" })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiPropertyOptional({ example: "https://twitter.com/f5" })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ example: "https://www.linkedin.com/company/f5/" })
  @IsString()
  @IsOptional()
  linkedIn?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsNumber()
  @IsOptional()
  date?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "http://res.cloudinary.com/deyp75nnw/image/upload/v1756142100/partners/eun6n1lq0yfcc24hvp4o.png" })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: "partners/eun6n1lq0yfcc24hvp4o", })
  @IsString()
  @IsOptional()
  logoPublicId?: string;
}

export class PartnerDto extends OmitType(CreatePartnerDto, ['logoPublicId', 'logoUrl']) {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  logo: any;
}

export class CreatePartnerResponseDto extends CreatePartnerDto {
  @ApiProperty({example:  1})
  id: number
}

export class GetAllPartnersResponseDto extends PickType(CreatePartnerResponseDto, ['id','name','logoUrl','isActive']) {}