// ============================================================================
// AUTH HTTP INTERCEPTOR
// ============================================================================
// Sends the HttpOnly auth cookies with API requests (withCredentials) and, on a
// 401, transparently refreshes the session once and retries. CSRF headers are
// handled by Angular's built-in XSRF support, not here.
// ============================================================================

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthStateService, AuthUser } from './auth-state.service';

const AUTH_ROUTE_PREFIX = '/api/auth/';

// A single in-flight refresh shared across concurrent 401s (module scope = one
// browser tab). Auth endpoints are excluded from refresh, so this is never set
// during the cookieless SSR pass — no cross-request state leakage.
let refreshInFlight: Observable<AuthUser> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const authApi = inject(AuthApiService);

  const request = req.url.startsWith('/api')
    ? req.clone({ withCredentials: true })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Recover only expired-session 401s on non-auth endpoints. A 401 on
      // login/register/me/refresh/logout is terminal (bad credentials or the
      // anonymous startup probe) and must not spawn a refresh loop.
      if (error.status !== 401 || request.url.includes(AUTH_ROUTE_PREFIX)) {
        return throwError(() => error);
      }

      return refreshSession(authApi).pipe(
        switchMap(() => next(request)),
        catchError((retryError) => {
          authState.clearAuth(true);
          return throwError(() => retryError);
        }),
      );
    }),
  );
};

function refreshSession(authApi: AuthApiService): Observable<AuthUser> {
  if (!refreshInFlight) {
    refreshInFlight = authApi.refresh().pipe(
      finalize(() => {
        refreshInFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }
  return refreshInFlight;
}
