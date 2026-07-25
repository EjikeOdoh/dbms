import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginResponseDto,
  MfaLoginDto,
  ProfileResponseDto,
  TotpCodeDto,
  UnauthorizedErrorDto,
} from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { Public } from 'src/decorators/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user and get access token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: UnauthorizedErrorDto,
  })
  async login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest) {
    return await this.authService.login(loginDto, this.requestMetadata(req));
  }

  @Post('mfa/setup')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start TOTP MFA enrollment for the current user' })
  setupMfa(@Request() req, @Req() rawRequest: ExpressRequest) {
    return this.authService.setupMfa(Number(req.user.sub), this.requestMetadata(rawRequest));
  }

  @Post('mfa/verify-enrollment')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify an authenticator code and enable MFA' })
  verifyEnrollment(@Request() req, @Body() dto: TotpCodeDto, @Req() rawRequest: ExpressRequest) {
    return this.authService.verifyMfaEnrollment(Number(req.user.sub), dto.code, this.requestMetadata(rawRequest));
  }

  @Public()
  @Post('mfa/verify-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete an MFA login challenge' })
  verifyMfaLogin(@Body() dto: MfaLoginDto, @Req() req: ExpressRequest) {
    return this.authService.verifyMfaLogin(dto.mfaToken, dto.code, this.requestMetadata(req));
  }

  @Post('mfa/disable')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Disable MFA after confirming an authenticator code' })
  disableMfa(@Request() req, @Body() dto: TotpCodeDto, @Req() rawRequest: ExpressRequest) {
    return this.authService.disableMfa(Number(req.user.sub), dto.code, this.requestMetadata(rawRequest));
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req, @Req() rawRequest: ExpressRequest) {
    return this.authService.logout(Number(req.user.sub), req.user.sid, this.requestMetadata(rawRequest));
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    const { sub } = req.user;
    return this.authService.getProfile(Number(sub));
  }

  private requestMetadata(req: ExpressRequest) {
    return { ipAddress: req.ip, userAgent: req.get('user-agent') };
  }
}
