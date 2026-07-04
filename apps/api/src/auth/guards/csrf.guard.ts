import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as crypto from 'crypto';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  XSRF_TOKEN_COOKIE,
} from '../auth-cookie.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-xsrf-token';

/**
 * Double-submit CSRF guard, interoperable with Angular's built-in XSRF support
 * (XSRF-TOKEN cookie ↔ X-XSRF-TOKEN header).
 *
 * Enforcement is keyed on the PRESENCE of an auth cookie rather than on whether
 * the route requires auth. A cross-site attacker can make the browser attach the
 * auth cookie ambiently, but cannot read the non-HttpOnly XSRF-TOKEN cookie to
 * mirror it into the header (same-origin policy) — so a mismatch is rejected.
 * Requests with no auth cookie (public mutations, Bearer API clients) carry no
 * ambient authority and are let through.
 *
 * Runs as a global guard before JwtAuthGuard, so it must rely only on
 * req.cookies (populated by cookie-parser middleware), never on req.user.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;

    const cookies = (req.cookies ?? {}) as Record<string, unknown>;
    const hasAuthCookie =
      typeof cookies[ACCESS_TOKEN_COOKIE] === 'string' ||
      typeof cookies[REFRESH_TOKEN_COOKIE] === 'string';

    if (!hasAuthCookie) return true;

    const headerToken = req.headers[CSRF_HEADER];
    const headerValue = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (!this.matches(cookies[XSRF_TOKEN_COOKIE], headerValue)) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }
    return true;
  }

  private matches(cookieToken: unknown, headerToken: unknown): boolean {
    if (typeof cookieToken !== 'string' || typeof headerToken !== 'string') {
      return false;
    }
    const cookieBuffer = Buffer.from(cookieToken);
    const headerBuffer = Buffer.from(headerToken);
    if (cookieBuffer.length !== headerBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(cookieBuffer, headerBuffer);
  }
}
