import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  AuthStateService,
  AuthUser,
  MessageResponse,
} from '@tanzmoment/shared/services';
import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UpdateProfileRequest,
} from './account.types';

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly baseUrl = '/api/auth';

  updateProfile(data: UpdateProfileRequest): Observable<AuthUser> {
    return this.http
      .patch<AuthUser>(`${this.baseUrl}/me`, data)
      .pipe(tap((user) => this.refreshCachedUser(user)));
  }

  changePassword(data: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.baseUrl}/me/password`, data);
  }

  changeEmail(data: ChangeEmailRequest): Observable<AuthUser> {
    return this.http
      .patch<AuthUser>(`${this.baseUrl}/me/email`, data)
      .pipe(tap((user) => this.refreshCachedUser(user)));
  }

  exportData(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/me/export`, { responseType: 'blob' });
  }

  deleteAccount(data: DeleteAccountRequest): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/me`, { body: data });
  }

  /** Keep the globally cached user in sync after a self-service profile change. */
  private refreshCachedUser(user: AuthUser): void {
    const token = this.authState.token();
    if (token) {
      this.authState.setAuth(token, user);
    }
  }
}
