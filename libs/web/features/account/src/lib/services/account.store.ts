import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AuthStateService,
  UserApiService,
  type ChangePasswordPayload,
  type DeleteAccountPayload,
  type RequestEmailChangePayload,
  type UpdateProfilePayload,
  type UserProfile,
} from '@tanzmoment/shared/services';

export type AccountLoadState = 'idle' | 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly userApi = inject(UserApiService);
  private readonly authState = inject(AuthStateService);

  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _loadState = signal<AccountLoadState>('idle');
  private readonly _loadError = signal<string | null>(null);

  readonly profile = this._profile.asReadonly();
  readonly loadState = this._loadState.asReadonly();
  readonly loadError = this._loadError.asReadonly();
  readonly isLoading = computed(() => this._loadState() === 'loading');
  readonly isReady = computed(() => this._loadState() === 'ready');

  load(force = false): void {
    if (!force && this._loadState() === 'ready') return;
    this._loadState.set('loading');
    this._loadError.set(null);

    this.userApi.getProfile().subscribe({
      next: (profile) => {
        this._profile.set(profile);
        this.syncAuthUser(profile);
        this._loadState.set('ready');
      },
      error: () => {
        this._loadError.set('Dein Profil konnte nicht geladen werden.');
        this._loadState.set('error');
      },
    });
  }

  updateProfile(payload: UpdateProfilePayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userApi.updateProfile(payload).subscribe({
        next: (user) => {
          const current = this._profile();
          this._profile.set({
            ...user,
            pendingEmail: current?.pendingEmail,
          });
          this.syncAuthUser(user);
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userApi.changePassword(payload).subscribe({
        next: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  requestEmailChange(payload: RequestEmailChangePayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userApi.requestEmailChange(payload).subscribe({
        next: () => {
          const current = this._profile();
          if (current) {
            this._profile.set({
              ...current,
              pendingEmail: payload.newEmail.toLowerCase().trim(),
            });
          }
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  cancelEmailChange(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userApi.cancelEmailChange().subscribe({
        next: () => {
          const current = this._profile();
          if (current) {
            this._profile.set({ ...current, pendingEmail: undefined });
          }
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  deleteAccount(payload: DeleteAccountPayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userApi.deleteAccount(payload).subscribe({
        next: () => {
          this.authState.clearAuth(false);
          this._profile.set(null);
          this._loadState.set('idle');
          resolve();
        },
        error: (err) => reject(err),
      });
    });
  }

  private syncAuthUser(profile: UserProfile): void {
    const token = this.authState.token();
    if (!token) return;
    this.authState.setAuth(token, {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      role: profile.role,
      emailVerified: profile.emailVerified,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
    });
  }
}
