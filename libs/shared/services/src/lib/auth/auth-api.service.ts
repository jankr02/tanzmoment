import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthUser } from './auth-state.service';

export interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/login`, { email, password });
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
  ): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/register`, {
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  }

  /** Rotate the session using the refresh cookie; resolves with the current user. */
  refresh(): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/refresh`, {});
  }

  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/logout`, {});
  }

  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`);
  }

  getMeAsync(): Promise<AuthUser | null> {
    return firstValueFrom(this.getMe()).catch(() => null);
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, {
      token,
      password,
    });
  }

  verifyEmail(token: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/verify-email`, { token });
  }

  resendVerification(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/resend-verification`, {});
  }
}
