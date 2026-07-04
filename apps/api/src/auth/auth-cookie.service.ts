import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import * as crypto from 'crypto';
import { accessTokenTtlSeconds, refreshTokenTtlSeconds } from './utils/token-ttl';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const XSRF_TOKEN_COOKIE = 'XSRF-TOKEN';

/**
 * The refresh cookie is scoped to the auth routes so it is never attached to
 * ordinary API calls (courses, bookings, ...), shrinking its exposure surface.
 * The global prefix is `api`, so auth routes live under `/api/auth`.
 */
const REFRESH_COOKIE_PATH = '/api/auth';

type SameSite = 'lax' | 'strict' | 'none';

interface AuthCookieBundle {
  jwt: string;
  refreshToken: string;
  xsrfToken: string;
}

/**
 * Centralizes issuing and clearing the auth cookies. Set and clear MUST use
 * identical path/sameSite/secure/domain attributes or the browser will not
 * match-and-delete the cookie, leaving a stale credential behind — hence a
 * single source of truth here.
 */
@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  get accessTokenTtlSeconds(): number {
    return accessTokenTtlSeconds(this.configService);
  }

  get refreshTokenTtlSeconds(): number {
    return refreshTokenTtlSeconds(this.configService);
  }

  generateXsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  setAuthCookies(res: Response, { jwt, refreshToken, xsrfToken }: AuthCookieBundle): void {
    this.setAccessCookie(res, jwt);
    this.setRefreshCookie(res, refreshToken);
    this.setXsrfCookie(res, xsrfToken);
  }

  setAccessCookie(res: Response, jwt: string): void {
    res.cookie(ACCESS_TOKEN_COOKIE, jwt, {
      ...this.baseOptions(true),
      path: '/',
      maxAge: this.accessTokenTtlSeconds * 1000,
    });
  }

  setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.baseOptions(true),
      path: REFRESH_COOKIE_PATH,
      maxAge: this.refreshTokenTtlSeconds * 1000,
    });
  }

  /**
   * The CSRF cookie is deliberately NOT HttpOnly: the SPA (Angular's built-in
   * XSRF support) must read it to echo the value in the X-XSRF-TOKEN header.
   * Its lifetime matches the refresh token so it never expires mid-session and
   * wrongly triggers a 403.
   */
  setXsrfCookie(res: Response, xsrfToken: string): void {
    res.cookie(XSRF_TOKEN_COOKIE, xsrfToken, {
      ...this.baseOptions(false),
      path: '/',
      maxAge: this.refreshTokenTtlSeconds * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { ...this.baseOptions(true), path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.baseOptions(true),
      path: REFRESH_COOKIE_PATH,
    });
    res.clearCookie(XSRF_TOKEN_COOKIE, { ...this.baseOptions(false), path: '/' });
  }

  private baseOptions(httpOnly: boolean): CookieOptions {
    const domain = this.configService.get<string>('COOKIE_DOMAIN')?.trim();
    return {
      httpOnly,
      secure: this.isSecure(),
      sameSite: this.sameSite(),
      ...(domain ? { domain } : {}),
    };
  }

  private isSecure(): boolean {
    const raw = this.configService.get<string>('COOKIE_SECURE');
    if (typeof raw === 'string' && raw.trim() !== '') {
      return raw.trim().toLowerCase() === 'true';
    }
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private sameSite(): SameSite {
    const raw = this.configService.get<string>('COOKIE_SAMESITE')?.trim().toLowerCase();
    if (raw === 'strict' || raw === 'none') {
      return raw;
    }
    return 'lax';
  }
}
