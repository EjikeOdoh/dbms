import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, MinLength } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.Viewer,
    description: 'The role assigned to the user',
    default: Role.Viewer,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'The user password (minimum 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Staff ID if the user is a staff', type: Number })
  @IsNumber()
  @IsOptional()
  staffId?: number;

  @ApiPropertyOptional({ description: 'Volunteer ID if the user is a volunteer', type: Number })
  @IsNumber()
  @IsOptional()
  volunteerId?: number;

}

