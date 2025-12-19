import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserMenuData } from '@tanzmoment/shared/ui';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'tanzmoment_auth_user';

  // Private state signals
  private _isAuthenticated = signal(false);
  private _currentUser = signal<User | null>(null);

  // Public read-only computed signals
  isAuthenticated = this._isAuthenticated.asReadonly();
  currentUser = this._currentUser.asReadonly();

  // Computed user menu data for header
  userMenuData = computed(() => {
    const user = this.currentUser();
    if (!user) return undefined;

    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      menuItems: [
        { label: 'Mein Profil', iconName: 'user' },
        { label: 'Meine Buchungen', iconName: 'calendar' },
        { label: 'Favoriten', iconName: 'heart' },
        { label: 'Einstellungen', iconName: 'settings' },
        { label: 'Abmelden', iconName: 'logout', action: () => this.logout() },
      ],
    } as UserMenuData;
  });

  // Demo users for showcase
  private demoUsers = [
    {
      id: '1',
      name: 'Anna Schmidt',
      email: 'anna@example.com',
      avatar: '👩',
      role: 'Tanzschülerin',
    },
    {
      id: '2',
      name: 'Maria Müller',
      email: 'maria@example.com',
      avatar: '👱‍♀️',
      role: 'Mutter & Tanzschülerin',
    },
    {
      id: '3',
      name: 'Lena Wagner',
      email: 'lena@example.com',
      avatar: '👧',
      role: 'Kind',
    },
  ];

  constructor() {
    // Load user from localStorage on init
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
        console.log(`[Auth] Restored user from storage: ${user.name}`);
      }
    } catch (error) {
      console.error('[Auth] Failed to restore from storage:', error);
      // Clear corrupted data
      this.clearStorage();
    }
  }

  private saveToStorage(user: User | null): void {
    if (!this.isBrowser) return;

    try {
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        this.clearStorage();
      }
    } catch (error) {
      console.error('[Auth] Failed to save to storage:', error);
    }
  }

  private clearStorage(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[Auth] Failed to clear storage:', error);
    }
  }

  login(userIndex: number = 0): void {
    const user = this.demoUsers[userIndex] || this.demoUsers[0];
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    this.saveToStorage(user);
    console.log(`[Auth] Logged in as: ${user.name}`);
  }

  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.clearStorage();
    console.log('[Auth] Logged out');
  }

  // Get demo users for UI selection
  getDemoUsers() {
    return this.demoUsers;
  }
}
