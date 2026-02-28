// ============================================================================
// AUTH STATE SERVICE
// ============================================================================
// Lightweight signal-based auth state.
// Used to pre-fill form data for logged-in users.
// NEVER blocks booking for guests.
// ============================================================================

import {
  Injectable,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const TOKEN_KEY = 'tm_access_token';
const USER_KEY = 'tm_user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _token = signal<string | null>(this.loadFromStorage(TOKEN_KEY));
  private readonly _user = signal<AuthUser | null>(this.loadJson(USER_KEY));

  readonly isAuthenticated = computed(() => !!this._token());
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();

  setAuth(token: string, user: AuthUser): void {
    this._token.set(token);
    this._user.set(user);
    this.saveToStorage(TOKEN_KEY, token);
    this.saveToStorage(USER_KEY, JSON.stringify(user));
  }

  clearAuth(): void {
    this._token.set(null);
    this._user.set(null);
    this.removeFromStorage(TOKEN_KEY);
    this.removeFromStorage(USER_KEY);
  }

  private loadFromStorage(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(key);
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
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(key, value);
  }

  private removeFromStorage(key: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(key);
  }
}
