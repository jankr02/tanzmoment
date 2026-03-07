import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '@tanzmoment/shared/services';

/**
 * Prevents authenticated users from accessing auth pages (login, register, etc.).
 * Redirects to home if already logged in.
 */
export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
