import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserDto } from '../auth/dto/auth-response.dto';

const EMAIL_CHANGE_EXPIRY_MS = 24 * 60 * 60 * 1000;
const ANONYMIZED_DOMAIN = 'anonymized.tanzmoment.local';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string): Promise<UserDto & { pendingEmail?: string }> {
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
        pendingEmail: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? undefined,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      pendingEmail: user.pendingEmail ?? undefined,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserDto> {
    const data: Record<string, unknown> = {};
    if (dto.firstName !== undefined) data['firstName'] = dto.firstName.trim();
    if (dto.lastName !== undefined) data['lastName'] = dto.lastName.trim();
    if (dto.phone !== undefined) {
      const trimmed = typeof dto.phone === 'string' ? dto.phone.trim() : null;
      data['phone'] = trimmed && trimmed.length > 0 ? trimmed : null;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Keine Änderungen übermittelt');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
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

    this.logger.log(`Profile updated: userId=${userId}`);

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone ?? undefined,
      role: updated.role,
      emailVerified: updated.emailVerified,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Das neue Passwort muss sich vom aktuellen unterscheiden',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    this.logger.log(`Password changed: userId=${userId}`);

    return { message: 'Dein Passwort wurde erfolgreich geändert.' };
  }

  async requestEmailChange(
    userId: string,
    dto: RequestEmailChangeDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }

    const newEmail = dto.newEmail.toLowerCase().trim();

    if (newEmail === user.email.toLowerCase()) {
      throw new BadRequestException(
        'Die neue E-Mail-Adresse ist mit der aktuellen identisch',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'Diese E-Mail-Adresse wird bereits verwendet',
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_MS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        emailChangeToken: token,
        emailChangeExpires: expires,
      },
    });

    const verifyLink = `${this.configService.get('FRONTEND_URL')}/auth/confirm-email-change?token=${token}`;

    this.emailService
      .send(
        newEmail,
        'Bestätige deine neue E-Mail-Adresse – Tanzmoment',
        'email-change-confirmation',
        {
          firstName: user.firstName,
          verifyLink,
          oldEmail: user.email,
          newEmail,
        },
      )
      .catch((err) => {
        this.logger.error(
          `Failed to send email-change confirmation to ${newEmail}: ${err.message}`,
        );
      });

    this.emailService
      .send(
        user.email,
        'E-Mail-Adresse wird geändert – Tanzmoment',
        'email-change-notice',
        {
          firstName: user.firstName,
          newEmail,
        },
      )
      .catch((err) => {
        this.logger.error(
          `Failed to send email-change notice to ${user.email}: ${err.message}`,
        );
      });

    this.logger.log(
      `Email change requested: userId=${userId}, newEmail=${newEmail}`,
    );

    return {
      message:
        'Wir haben dir einen Bestätigungslink an die neue E-Mail-Adresse gesendet.',
    };
  }

  async confirmEmailChange(
    dto: ConfirmEmailChangeDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailChangeToken: dto.token,
        emailChangeExpires: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        pendingEmail: true,
      },
    });

    if (!user || !user.pendingEmail) {
      throw new BadRequestException(
        'Der Bestätigungslink ist ungültig oder abgelaufen.',
      );
    }

    const conflict = await this.prisma.user.findUnique({
      where: { email: user.pendingEmail },
      select: { id: true },
    });

    if (conflict && conflict.id !== user.id) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          pendingEmail: null,
          emailChangeToken: null,
          emailChangeExpires: null,
        },
      });

      throw new ConflictException(
        'Diese E-Mail-Adresse wird inzwischen von einem anderen Konto verwendet.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
      },
    });

    this.logger.log(`Email changed: userId=${user.id}, newEmail=${user.pendingEmail}`);

    return { message: 'Deine neue E-Mail-Adresse wurde bestätigt.' };
  }

  async cancelEmailChange(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
      },
    });

    return { message: 'Die E-Mail-Änderung wurde abgebrochen.' };
  }

  async deleteAccount(
    userId: string,
    dto: DeleteAccountDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, role: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException(
        'Admin-Konten können nicht über das Profil gelöscht werden',
      );
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Aktuelles Passwort ist falsch');
    }

    const anonymizedEmail = `deleted-${userId}@${ANONYMIZED_DOMAIN}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        firstName: 'Gelöscht',
        lastName: '',
        phone: null,
        passwordHash: null,
        isActive: false,
        deletedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
      },
    });

    this.logger.log(`Account anonymized (soft-delete): userId=${userId}`);

    return {
      message:
        'Dein Konto wurde gelöscht. Buchungs- und Zahlungsdaten bleiben aus rechtlichen Gründen anonymisiert erhalten.',
    };
  }
}
