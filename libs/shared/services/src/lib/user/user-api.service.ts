import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthUser } from '../auth/auth-state.service';
import { MessageResponse } from '../auth/auth-api.service';

export interface UserProfile extends AuthUser {
  pendingEmail?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface RequestEmailChangePayload {
  newEmail: string;
  currentPassword: string;
}

export interface DeleteAccountPayload {
  currentPassword: string;
  confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users/me';

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.baseUrl);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<AuthUser> {
    return this.http.patch<AuthUser>(this.baseUrl, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.baseUrl}/password`, payload);
  }

  requestEmailChange(
    payload: RequestEmailChangePayload,
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/email/change`, payload);
  }

  confirmEmailChange(token: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>('/api/users/me/email/confirm', {
      token,
    });
  }

  cancelEmailChange(): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/email/change`);
  }

  deleteAccount(payload: DeleteAccountPayload): Observable<MessageResponse> {
    return this.http.request<MessageResponse>('DELETE', this.baseUrl, {
      body: payload,
    });
  }
}
