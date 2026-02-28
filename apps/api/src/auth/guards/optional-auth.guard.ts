import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that extracts user from JWT if present, but does NOT reject
 * unauthenticated requests. Sets req.user = null for guests.
 *
 * Use case: Booking endpoint accepts both registered users and guests.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /**
   * Override: Never throw on missing/invalid token.
   * Returns the user if valid, null otherwise.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
