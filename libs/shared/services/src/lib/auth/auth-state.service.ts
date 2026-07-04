// ============================================================================
// AUTH STATE SERVICE
// ============================================================================
// Signal-based global auth state. The credential itself lives in HttpOnly
// cookies (invisible to JS); this service only tracks the derived user object
// and initializes it from the server on startup.
// ============================================================================

import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'INSTRUCTOR' | 'ADMIN';
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _initialized = signal(false);
  private readonly _loading = signal(false);

  // ── Public Selectors ──────────────────────────────────────────────────────

  readonly user = this._user.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isInstructor = computed(
    () => this._user()?.role === 'INSTRUCTOR' || this._user()?.role === 'ADMIN',
  );

  readonly displayName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  readonly initials = computed(() => {
    const u = this._user();
    if (!u) return '';
    return `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Store the user after login/register/profile-change (cookies are set by the server). */
  setAuth(user: AuthUser): void {
    this._user.set(user);
  }

  /** Clear local auth state. Server-side session revocation happens via the logout endpoint. */
  clearAuth(redirect = false): void {
    this._user.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Restore the session on startup via GET /auth/me (the auth cookie is sent
   * automatically). Runs once during APP_INITIALIZER, so route guards observe a
   * settled state. An unauthenticated visitor simply resolves to a null user.
   */
  async initialize(getMe: () => Promise<AuthUser | null>): Promise<void> {
    if (this._initialized()) return;

    // The session lives in cookies that are not forwarded during SSR/prerender,
    // so the server pass is always anonymous — restore only in the browser.
    if (!isPlatformBrowser(this.platformId)) {
      this._initialized.set(true);
      return;
    }

    this._loading.set(true);
    try {
      this._user.set(await getMe());
    } catch {
      this._user.set(null);
    } finally {
      this._loading.set(false);
      this._initialized.set(true);
    }
  }
}
