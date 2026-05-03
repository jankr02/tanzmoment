import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SubscribeRequest,
  SubscriberStatusResponse,
  UpdatePreferencesRequest,
} from './newsletter.types';

@Injectable({ providedIn: 'root' })
export class NewsletterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/newsletter';

  subscribe(data: SubscribeRequest): Observable<SubscriberStatusResponse> {
    return this.http.post<SubscriberStatusResponse>(
      `${this.baseUrl}/subscribe`,
      data,
    );
  }

  getMyStatus(): Observable<SubscriberStatusResponse> {
    return this.http.get<SubscriberStatusResponse>(`${this.baseUrl}/me/status`);
  }

  updatePreference(
    payload: UpdatePreferencesRequest,
  ): Observable<SubscriberStatusResponse> {
    return this.http.post<SubscriberStatusResponse>(
      `${this.baseUrl}/me/preferences`,
      payload,
    );
  }
}
