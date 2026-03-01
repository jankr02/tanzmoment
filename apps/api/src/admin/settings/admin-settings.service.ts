import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  UpdateStudioSettingsDto,
  StudioSettingsResponseDto,
} from './dto/studio-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudioSettings(): Promise<StudioSettingsResponseDto> {
    let settings = await this.prisma.studioSettings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      settings = await this.prisma.studioSettings.create({
        data: { id: 'singleton' },
      });
    }

    return this.mapToDto(settings);
  }

  async updateStudioSettings(
    dto: UpdateStudioSettingsDto,
  ): Promise<StudioSettingsResponseDto> {
    const settings = await this.prisma.studioSettings.upsert({
      where: { id: 'singleton' },
      update: dto,
      create: { id: 'singleton', ...dto },
    });

    return this.mapToDto(settings);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  private mapToDto(settings: {
    name: string;
    tagline: string | null;
    description: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    updatedAt: Date;
  }): StudioSettingsResponseDto {
    return {
      name: settings.name,
      tagline: settings.tagline ?? undefined,
      description: settings.description ?? undefined,
      email: settings.email ?? undefined,
      phone: settings.phone ?? undefined,
      website: settings.website ?? undefined,
      address: settings.address ?? undefined,
      updatedAt: settings.updatedAt,
    };
  }
}
