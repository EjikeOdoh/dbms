import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/enums/role.enum';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  email: string;

  @ApiProperty({ example: 'password' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6Ikpv
aG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY5MzAw
MDAwMCwiZXhwIjoxNjkzMDAzNjAwfQ.V3g6Jf3Z2N6w4p8pR0m0TjYz0FqRmP0E8sP3lRZc6Gc
`,
  })
  token: string;
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
