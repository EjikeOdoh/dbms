import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TotpCodeDto {
  @ApiProperty({ example: '123456', description: 'Six-digit code from the authenticator app' })
  @IsString()
  @Matches(/^\d{6}$/)
  code: string;
}

export class MfaLoginDto extends TotpCodeDto {
  @ApiProperty({ description: 'Short-lived MFA challenge returned by the login endpoint' })
  @IsString()
  @IsNotEmpty()
  mfaToken: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6Ikpv
aG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY5MzAw
MDAwMCwiZXhwIjoxNjkzMDAzNjAwfQ.V3g6Jf3Z2N6w4p8pR0m0TjYz0FqRmP0E8sP3lRZc6Gc
`,
  })
  token?: string;

  @ApiProperty({ required: false, example: true })
  mfaRequired?: boolean;

  @ApiProperty({ required: false })
  mfaToken?: string;
}

export class UnauthorizedErrorDto {
  @ApiProperty({
    example: 'Invalid login credentials',
  })
  message: string;

  @ApiProperty({
    example: 'Unauthorized',
  })
  error: string;

  @ApiProperty({
    example: 401,
  })
  statusCode: number;
}

export class ProfileResponseDto {
  @ApiProperty({
    example: Role.Admin,
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    example: 'admin',
  })
  email: string;
}
