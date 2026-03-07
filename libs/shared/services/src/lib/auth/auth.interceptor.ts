// ============================================================================
// AUTH HTTP INTERCEPTOR
// ============================================================================
// Attaches JWT to API requests and auto-logs out on 401 responses
// (except for auth endpoints themselves to avoid redirect loops).
// ============================================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from './auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const token = authState.token();

  if (token && req.url.startsWith('/api')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auto-logout on 401, but not for auth endpoints (avoids redirect loops)
      if (error.status === 401 && !req.url.includes('/api/auth/')) {
        authState.clearAuth(true);
      }
      return throwError(() => error);
    }),
  );
};
