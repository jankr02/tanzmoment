// ============================================================================
// BOOKING API SERVICE
// ============================================================================
// HTTP client for booking endpoints.
// Supports both authenticated and guest booking flows.
// ============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SessionAvailability,
  CreateBookingApiRequest,
  CreateBookingApiResponse,
  BookingDetail,
  CancellationPreview,
} from '@tanzmoment/shared/types';

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // ──────────────────────────────────────────────────────────────────────────
  // SESSIONS
  // ──────────────────────────────────────────────────────────────────────────

  getSessionsForCourse(courseId: string): Observable<SessionAvailability[]> {
    return this.http.get<SessionAvailability[]>(
      `${this.baseUrl}/courses/${courseId}/sessions`,
      {
        params: new HttpParams()
          .set('includeAvailability', 'true')
          .set('status', 'SCHEDULED'),
      }
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BOOKINGS
  // ──────────────────────────────────────────────────────────────────────────

  createBooking(request: CreateBookingApiRequest): Observable<CreateBookingApiResponse> {
    return this.http.post<CreateBookingApiResponse>(
      `${this.baseUrl}/bookings`,
      request
    );
  }

  getBooking(bookingId: string): Observable<BookingDetail> {
    return this.http.get<BookingDetail>(
      `${this.baseUrl}/bookings/${bookingId}`
    );
  }

  getMyBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<MyBookingsResponse> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<MyBookingsResponse>(`${this.baseUrl}/bookings`, {
      params: httpParams,
    });
  }

  getCancellationPreview(bookingId: string): Observable<CancellationPreview> {
    return this.http.get<CancellationPreview>(
      `${this.baseUrl}/bookings/${bookingId}/cancellation-preview`
    );
  }

  cancelBooking(bookingId: string, reason?: string): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/bookings/${bookingId}/cancel`, {
      reason,
    });
  }

  cancelByToken(token: string): Observable<unknown> {
    return this.http.patch(
      `${this.baseUrl}/bookings/cancel-by-token`,
      null,
      { params: new HttpParams().set('token', token) }
    );
  }

  resumeCheckout(bookingId: string): Observable<{ checkoutUrl: string }> {
    return this.http.post<{ checkoutUrl: string }>(
      `${this.baseUrl}/bookings/${bookingId}/resume-checkout`,
      {}
    );
  }

  downloadReceipt(bookingId: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/bookings/${bookingId}/receipt.pdf`,
      { responseType: 'blob' }
    );
  }

  verifyBookingPayment(
    bookingId: string,
    sessionId: string
  ): Observable<BookingDetail> {
    return this.http.get<BookingDetail>(
      `${this.baseUrl}/bookings/${bookingId}/verify-payment`,
      { params: { session_id: sessionId } }
    );
  }
}

export interface MyBookingsResponse {
  data: BookingDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
