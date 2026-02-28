import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
  };
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, {
      email,
      password,
    });
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, {
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  }

  getMe(): Observable<AuthResponse['user']> {
    return this.http.get<AuthResponse['user']>(`${this.baseUrl}/me`);
  }
}
