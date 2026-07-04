import { ConfigService } from '@nestjs/config';
import { parseDurationToSeconds } from './parse-duration';

export const DEFAULT_ACCESS_TTL = '15m';
export const DEFAULT_REFRESH_TTL = '30d';

/**
 * Single source of truth for token lifetimes so the JWT/cookie maxAge and the
 * persisted refresh-token `expiresAt` can never drift apart.
 */
export function accessTokenTtlSeconds(config: ConfigService): number {
  return parseDurationToSeconds(config.get<string>('JWT_EXPIRES_IN') || DEFAULT_ACCESS_TTL);
}

export function refreshTokenTtlSeconds(config: ConfigService): number {
  return parseDurationToSeconds(
    config.get<string>('REFRESH_TOKEN_TTL') || DEFAULT_REFRESH_TTL,
  );
}
