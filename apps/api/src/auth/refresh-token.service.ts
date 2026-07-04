import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './auth.types';
import { refreshTokenTtlSeconds } from './utils/token-ttl';

const REFRESH_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  emailVerified: true,
  isActive: true,
  createdAt: true,
} as const;

/**
 * A token revoked within this window is treated as a benign concurrent rotation
 * (e.g. two browser tabs refreshing at once) rather than stolen-token reuse: the
 * racing request is rejected but the family is NOT burned, so the user's other
 * devices stay logged in. Genuine reuse of an older revoked token still burns
 * the family.
 */
const CONCURRENT_ROTATION_GRACE_MS = 10_000;

export interface IssuedRefreshToken {
  rawToken: string;
  family: string;
  expiresAt: Date;
}

export interface RotatedRefreshToken {
  user: AuthenticatedUser;
  rawToken: string;
}

/**
 * Manages the lifecycle of rotating refresh tokens. Only SHA-256 hashes of the
 * high-entropy random tokens are persisted; a 256-bit random value is not
 * brute-forceable, so a fast indexed hash is both sufficient and necessary for
 * lookup (bcrypt/argon could not be queried by hash).
 */
@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /** Create a fresh refresh token, optionally continuing an existing family (rotation). */
  async issue(userId: string, family?: string): Promise<IssuedRefreshToken> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const ttlSeconds = refreshTokenTtlSeconds(this.configService);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const tokenFamily = family ?? crypto.randomUUID();

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hash(rawToken),
        userId,
        family: tokenFamily,
        expiresAt,
      },
    });

    return { rawToken, family: tokenFamily, expiresAt };
  }

  /**
   * Validate and rotate a presented refresh token. Rotation revokes the old
   * token and issues a new one in the same family. Presenting an already-revoked
   * token means it was replayed after rotation (stolen-token reuse) → the whole
   * family is revoked so the attacker and the victim both lose the session.
   */
  async rotate(rawToken: string | undefined): Promise<RotatedRefreshToken> {
    if (!rawToken) {
      throw new UnauthorizedException('Kein gültiges Refresh-Token');
    }

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(rawToken) },
    });

    if (!existing) {
      throw new UnauthorizedException('Kein gültiges Refresh-Token');
    }

    if (existing.revokedAt) {
      const revokedAgoMs = Date.now() - existing.revokedAt.getTime();
      if (revokedAgoMs > CONCURRENT_ROTATION_GRACE_MS) {
        // Replay of an older revoked token: treat as compromise and burn the lineage.
        await this.revokeFamily(existing.family);
        this.logger.warn(
          `Refresh token reuse detected for user ${existing.userId}; family revoked`,
        );
      }
      // Within the grace window this is a benign concurrent rotation (e.g. two
      // tabs): reject this request but keep the family and other devices intact.
      throw new UnauthorizedException('Kein gültiges Refresh-Token');
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Kein gültiges Refresh-Token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: existing.userId },
      select: REFRESH_USER_SELECT,
    });

    if (!user || !user.isActive) {
      await this.revokeFamily(existing.family);
      throw new UnauthorizedException('Kein gültiges Refresh-Token');
    }

    // Issue the successor before revoking the current token so a failure of the
    // second write never leaves the family without a live token.
    const { rawToken: newRawToken } = await this.issue(user.id, existing.family);
    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return { user, rawToken: newRawToken };
  }

  /** Revoke every active token in a family (single logical session/login). */
  async revokeFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Revoke the family the given raw token belongs to (used on logout). No-op if unknown. */
  async revokeByRawToken(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(rawToken) },
      select: { family: true },
    });
    if (existing) {
      await this.revokeFamily(existing.family);
    }
  }

  /** Revoke all of a user's tokens (password reset, account deletion). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hash(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }
}
