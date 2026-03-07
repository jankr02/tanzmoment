// ============================================================================
// AUTH STATE SERVICE
// ============================================================================
// Signal-based global auth state. Handles session persistence, initialization,
// and computed derived state (roles, display name, etc.).
// ============================================================================

import {
  Injectable,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
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

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

const TOKEN_KEY = 'tm_access_token';
const USER_KEY = 'tm_user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(this.loadFromStorage(TOKEN_KEY));
  private readonly _user = signal<AuthUser | null>(this.loadJson<AuthUser>(USER_KEY));
  private readonly _initialized = signal(false);
  private readonly _loading = signal(false);

  // ── Public Selectors ──────────────────────────────────────────────────────

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());
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

  /**
   * Store auth state after login or register.
   * Accepts either (token, user) for backwards compatibility or a full AuthResponse.
   */
  setAuth(tokenOrResponse: string | AuthResponse, user?: AuthUser): void {
    if (typeof tokenOrResponse === 'string') {
      this._token.set(tokenOrResponse);
      this._user.set(user!);
      this.saveToStorage(TOKEN_KEY, tokenOrResponse);
      this.saveToStorage(USER_KEY, JSON.stringify(user));
    } else {
      this._token.set(tokenOrResponse.accessToken);
      this._user.set(tokenOrResponse.user);
      this.saveToStorage(TOKEN_KEY, tokenOrResponse.accessToken);
      this.saveToStorage(USER_KEY, JSON.stringify(tokenOrResponse.user));
    }
  }

  clearAuth(redirect = false): void {
    this._token.set(null);
    this._user.set(null);
    this.removeFromStorage(TOKEN_KEY);
    this.removeFromStorage(USER_KEY);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Restore session from stored token via GET /auth/me.
   * Call once during APP_INITIALIZER by passing the getMe function.
   */
  async initialize(getMe: () => Promise<AuthUser | null>): Promise<void> {
    if (this._initialized()) return;

    const token = this.loadFromStorage(TOKEN_KEY);
    if (!token) {
      this._initialized.set(true);
      return;
    }

    this._token.set(token);
    this._loading.set(true);

    try {
      const user = await getMe();
      if (user) {
        this._user.set(user);
        this.saveToStorage(USER_KEY, JSON.stringify(user));
      } else {
        this.clearAuth();
      }
    } catch {
      this.clearAuth();
    } finally {
      this._loading.set(false);
      this._initialized.set(true);
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private loadFromStorage(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private loadJson<T>(key: string): T | null {
    const raw = this.loadFromStorage(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveToStorage(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silent fail for storage errors
    }
  }

  private removeFromStorage(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  }
}
