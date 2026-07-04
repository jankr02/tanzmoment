import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Header,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import {
  AuthCookieService,
  REFRESH_TOKEN_COOKIE,
  XSRF_TOKEN_COOKIE,
} from './auth-cookie.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipCsrf } from './decorators/skip-csrf.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: UserDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body(ValidationPipe) dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.authService.register(dto);
    await this.issueSession(req, res, user);
    return this.authService.toUserDto(user);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body(ValidationPipe) dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.authService.login(dto);
    await this.issueSession(req, res, user);
    return this.authService.toUserDto(user);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the session using the refresh cookie' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const { user, rawToken } = await this.refreshTokenService.rotate(
      req.cookies?.[REFRESH_TOKEN_COOKIE],
    );
    this.authCookieService.setAuthCookies(res, {
      jwt: this.authService.signAccessToken(user.id, user.email, user.role),
      refreshToken: rawToken,
      // Preserve the existing CSRF token across refresh so an in-flight request
      // retried after a 401 still matches (its header was captured pre-refresh).
      xsrfToken: this.resolveXsrfToken(req),
    });
    return this.authService.toUserDto(user);
  }

  @Post('logout')
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session and clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // CSRF-exempt: logging a user out is not a state change worth protecting, and
    // it must succeed even if the XSRF cookie is missing so the refresh family is
    // always revoked. SameSite=Lax still blocks the cookie on cross-site POSTs.
    await this.refreshTokenService.revokeByRawToken(req.cookies?.[REFRESH_TOKEN_COOKIE]);
    this.authCookieService.clearAuthCookies(res);
    return { message: 'Du wurdest abgemeldet.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    // Seed a CSRF token for a returning user who lacks one, so their first
    // mutating request has a match. If they already have one, leave it untouched.
    if (!req.cookies?.[XSRF_TOKEN_COOKIE]) {
      this.authCookieService.setXsrfCookie(res, this.authCookieService.generateXsrfToken());
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent (if account exists)' })
  async forgotPassword(
    @Body(ValidationPipe) dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body(ValidationPipe) dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Body(ValidationPipe) dto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent' })
  async resendVerification(@CurrentUser() user: any): Promise<{ message: string }> {
    return this.authService.resendVerification(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile data' })
  @ApiResponse({ status: 200, type: UserDto })
  async updateProfile(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ): Promise<UserDto> {
    return this.authService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change own password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const result = await this.authService.changePassword(user.id, dto);
    // changePassword revoked every session; re-establish this device with a
    // fresh pair so the current user stays logged in while others are signed out.
    await this.issueSession(req, res, user);
    return result;
  }

  @Patch('me/email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change own email (requires re-verification)' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async changeEmail(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: ChangeEmailDto,
  ): Promise<UserDto> {
    return this.authService.changeEmail(user.id, dto);
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="tanzmoment-export.json"')
  @ApiOperation({ summary: 'Export own personal data (GDPR)' })
  @ApiResponse({ status: 200, description: 'User data export' })
  async exportData(@CurrentUser() user: any): Promise<Record<string, unknown>> {
    return this.authService.exportUserData(user.id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete (anonymize) own account (GDPR)' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async deleteAccount(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const result = await this.authService.deleteAccount(user.id, dto);
    this.authCookieService.clearAuthCookies(res);
    return result;
  }

  /** Keep an existing CSRF token stable, or mint one if the request has none. */
  private resolveXsrfToken(req: Request): string {
    const existing = req.cookies?.[XSRF_TOKEN_COOKIE];
    return typeof existing === 'string' && existing.length > 0
      ? existing
      : this.authCookieService.generateXsrfToken();
  }

  /** Sign an access token, issue a new refresh-token family, and set all auth cookies. */
  private async issueSession(
    req: Request,
    res: Response,
    user: { id: string; email: string; role: UserRole },
  ): Promise<void> {
    const { rawToken } = await this.refreshTokenService.issue(user.id);
    this.authCookieService.setAuthCookies(res, {
      jwt: this.authService.signAccessToken(user.id, user.email, user.role),
      refreshToken: rawToken,
      // Preserve an existing CSRF token so a concurrent request that already
      // captured the header value isn't invalidated by a rotated cookie.
      xsrfToken: this.resolveXsrfToken(req),
    });
  }
}
