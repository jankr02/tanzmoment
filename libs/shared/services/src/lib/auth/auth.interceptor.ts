// ============================================================================
// AUTH HTTP INTERCEPTOR
// ============================================================================
// Attaches JWT token to API requests IF available.
// Does NOT block requests for unauthenticated users.
// ============================================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from './auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const token = authState.token();

  if (token && req.url.startsWith('/api')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
