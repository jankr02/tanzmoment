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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
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

  // ── Update Profile ────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? null,
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

    this.logger.log(`Profile updated for: ${user.email}`);

    return this.sanitizeUser(user);
  }

  // ── Change Password ───────────────────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Benutzer nicht gefunden');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Das aktuelle Passwort ist falsch');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    this.logger.log(`Password changed for: ${user.email}`);

    return { message: 'Dein Passwort wurde erfolgreich geändert.' };
  }

  // ── Change Email ──────────────────────────────────────────────────────────

  async changeEmail(userId: string, dto: ChangeEmailDto): Promise<UserDto> {
    const newEmail = dto.newEmail.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Benutzer nicht gefunden');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Das aktuelle Passwort ist falsch');
    }

    if (newEmail !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
      if (existing) {
        throw new ConflictException('Diese E-Mail-Adresse wird bereits verwendet');
      }
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: false,
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

    this.emailService
      .send(
        newEmail,
        'Bitte bestätige deine E-Mail-Adresse – Tanzmoment',
        'email-verification',
        {
          firstName: updated.firstName,
          verifyLink: `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${verificationToken}`,
        },
      )
      .catch((err) => {
        this.logger.error(`Failed to send verification email to ${newEmail}: ${err.message}`);
      });

    this.logger.log(`Email changed to ${newEmail} for user ${userId}`);

    return this.sanitizeUser(updated);
  }

  // ── Export User Data (GDPR) ───────────────────────────────────────────────

  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        updatedAt: true,
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            cancelledAt: true,
            cancellationReason: true,
            notes: true,
            course: { select: { title: true } },
            session: { select: { startTime: true, endTime: true } },
          },
        },
        payments: {
          select: {
            id: true,
            amountInCents: true,
            currency: true,
            status: true,
            method: true,
            paidAt: true,
            refundedAmount: true,
            refundedAt: true,
            createdAt: true,
          },
        },
        newsletterSubscriber: {
          select: { status: true, confirmedAt: true, unsubscribedAt: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Benutzer nicht gefunden');
    }

    return {
      exportedAt: new Date().toISOString(),
      account: user,
    };
  }

  // ── Delete Account (GDPR – anonymize) ─────────────────────────────────────

  async deleteAccount(userId: string, dto: DeleteAccountDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Benutzer nicht gefunden');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Das aktuelle Passwort ist falsch');
    }

    // Anonymize instead of hard-delete so bookings/payments stay intact for
    // accounting and Stripe reconciliation. Email is scrubbed to a unique
    // placeholder to free up the original address while keeping the unique constraint.
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@deleted.tanzmoment.invalid`,
        firstName: 'Gelöschtes',
        lastName: 'Konto',
        phone: null,
        passwordHash: null,
        isActive: false,
        emailVerified: false,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    this.logger.log(`Account anonymized for user ${userId}`);

    return { message: 'Dein Konto wurde gelöscht.' };
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
