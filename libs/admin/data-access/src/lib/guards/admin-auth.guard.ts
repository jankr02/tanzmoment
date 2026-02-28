import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '@tanzmoment/shared/services';

const ADMIN_ROLES = ['ADMIN', 'INSTRUCTOR'];

export const adminAuthGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const user = authState.user();

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
