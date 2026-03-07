import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // ── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Ein Konto mit dieser E-Mail-Adresse existiert bereits');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'CUSTOMER',
        emailVerified: false,
        isActive: true,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    // Send verification email non-blocking – registration succeeds even if email fails
    this.emailService
      .send(
        user.email,
        'Bitte bestätige deine E-Mail-Adresse – Tanzmoment',
        'email-verification',
        {
          firstName: user.firstName,
          verifyLink: `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${verificationToken}`,
        },
      )
      .catch((err) => {
        this.logger.error(`Failed to send verification email to ${user.email}: ${err.message}`);
      });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.getTokenExpiresIn(),
    };
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('E-Mail oder Passwort ist falsch');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Dein Konto wurde deaktiviert');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-Mail oder Passwort ist falsch');
    }

    this.logger.log(`User logged in: ${user.email}`);

    const token = this.generateToken(user.id, user.email, user.role);
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: this.sanitizeUser(userWithoutPassword),
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.getTokenExpiresIn(),
    };
  }

  // ── Forgot Password ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const genericMessage =
      'Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen gesendet.';

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return the same message to prevent user enumeration
    if (!user || !user.isActive) {
      return { message: genericMessage };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    await this.emailService.send(
      user.email,
      'Passwort zurücksetzen – Tanzmoment',
      'password-reset',
      {
        firstName: user.firstName,
        resetLink: `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`,
      },
    );

    this.logger.log(`Password reset requested for: ${user.email}`);

    return { message: genericMessage };
  }

  // ── Reset Password ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    this.logger.log(`Password reset completed for: ${user.email}`);

    return { message: 'Dein Passwort wurde erfolgreich geändert.' };
  }

  // ── Verify Email ──────────────────────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: dto.token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Der Verifizierungslink ist ungültig oder abgelaufen.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    this.logger.log(`Email verified for: ${user.email}`);

    return { message: 'Deine E-Mail-Adresse wurde erfolgreich bestätigt!' };
  }

  // ── Resend Verification ───────────────────────────────────────────────────

  async resendVerification(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Benutzer nicht gefunden');
    }

    if (user.emailVerified) {
      return { message: 'Deine E-Mail ist bereits bestätigt.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    await this.emailService.send(
      user.email,
      'Bitte bestätige deine E-Mail-Adresse – Tanzmoment',
      'email-verification',
      {
        firstName: user.firstName,
        verifyLink: `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`,
      },
    );

    return { message: 'Wir haben dir eine neue Bestätigungs-E-Mail gesendet.' };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  private getTokenExpiresIn(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    if (expiresIn.endsWith('d')) return parseInt(expiresIn) * 24 * 60 * 60;
    if (expiresIn.endsWith('h')) return parseInt(expiresIn) * 60 * 60;
    return 604800;
  }

  private sanitizeUser(user: any): UserDto {
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
}
