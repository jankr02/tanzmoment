import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../types/dashboard.types';
import {
  AdminCourseListResponse,
  AdminCourseDetail,
  AdminCourseQueryParams,
  CreateCourseRequest,
  AdminSession,
  CreateSessionRequest,
  CreateSessionSeriesRequest,
  AdminLocation,
  SessionParticipant,
} from '../types/course.types';
import {
  AdminBookingListItem,
  AdminBookingDetail,
  BookingListFilters,
  BookingListResponse,
} from '../types/booking.types';
import { CalendarSession } from '../types/calendar.types';
import {
  AdminCustomerDetail,
  CustomerNote,
  CustomerListFilters,
  CustomerListResponse,
} from '../types/customer.types';
import {
  FinanceSummary,
  FinancePaymentListResponse,
  FinancePaymentFilters,
  MonthlyRevenueStat,
} from '../types/finance.types';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin';

  // -------------------------------------------------------------------------
  // DASHBOARD
  // -------------------------------------------------------------------------

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  // -------------------------------------------------------------------------
  // COURSES
  // -------------------------------------------------------------------------

  getCourses(params?: AdminCourseQueryParams): Observable<AdminCourseListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.danceStyle) httpParams = httpParams.set('danceStyle', params.danceStyle);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    return this.http.get<AdminCourseListResponse>(`${this.baseUrl}/courses`, {
      params: httpParams,
    });
  }

  getCourse(id: string): Observable<AdminCourseDetail> {
    return this.http.get<AdminCourseDetail>(`${this.baseUrl}/courses/${id}`);
  }

  createCourse(data: CreateCourseRequest): Observable<AdminCourseDetail> {
    return this.http.post<AdminCourseDetail>(`${this.baseUrl}/courses`, data);
  }

  updateCourse(
    id: string,
    data: Partial<CreateCourseRequest>,
  ): Observable<AdminCourseDetail> {
    return this.http.patch<AdminCourseDetail>(
      `${this.baseUrl}/courses/${id}`,
      data,
    );
  }

  archiveCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/courses/${id}`);
  }

  togglePublishCourse(
    id: string,
  ): Observable<{ isPublished: boolean; status: string }> {
    return this.http.patch<{ isPublished: boolean; status: string }>(
      `${this.baseUrl}/courses/${id}/publish`,
      {},
    );
  }

  duplicateCourse(id: string): Observable<AdminCourseDetail> {
    return this.http.post<AdminCourseDetail>(
      `${this.baseUrl}/courses/${id}/duplicate`,
      {},
    );
  }

  // -------------------------------------------------------------------------
  // SESSIONS
  // -------------------------------------------------------------------------

  createSession(data: CreateSessionRequest): Observable<AdminSession> {
    return this.http.post<AdminSession>(`${this.baseUrl}/sessions`, data);
  }

  createSessionSeries(
    data: CreateSessionSeriesRequest,
  ): Observable<{ created: number; sessions: AdminSession[] }> {
    return this.http.post<{ created: number; sessions: AdminSession[] }>(
      `${this.baseUrl}/sessions/series`,
      data,
    );
  }

  updateSession(
    id: string,
    data: Partial<CreateSessionRequest>,
  ): Observable<AdminSession> {
    return this.http.patch<AdminSession>(
      `${this.baseUrl}/sessions/${id}`,
      data,
    );
  }

  cancelSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  getSessionParticipants(id: string): Observable<SessionParticipant[]> {
    return this.http.get<SessionParticipant[]>(
      `${this.baseUrl}/sessions/${id}/participants`,
    );
  }

  // -------------------------------------------------------------------------
  // LOCATIONS
  // -------------------------------------------------------------------------

  getLocations(): Observable<AdminLocation[]> {
    return this.http.get<AdminLocation[]>(`${this.baseUrl}/locations`);
  }

  createLocation(data: {
    name: string;
    address?: string;
  }): Observable<AdminLocation> {
    return this.http.post<AdminLocation>(`${this.baseUrl}/locations`, data);
  }

  updateLocation(
    id: string,
    data: { name?: string; address?: string; isActive?: boolean },
  ): Observable<AdminLocation> {
    return this.http.patch<AdminLocation>(
      `${this.baseUrl}/locations/${id}`,
      data,
    );
  }

  // -------------------------------------------------------------------------
  // BOOKINGS
  // Note: Booking endpoints live at /api/admin/bookings (in the bookings module)
  // -------------------------------------------------------------------------

  getBookings(filters?: BookingListFilters): Observable<BookingListResponse> {
    let httpParams = new HttpParams();
    if (filters) {
      if (filters.status) httpParams = httpParams.set('status', filters.status);
      if (filters.courseId) httpParams = httpParams.set('courseId', filters.courseId);
      if (filters.from) httpParams = httpParams.set('from', filters.from);
      if (filters.to) httpParams = httpParams.set('to', filters.to);
      if (filters.paymentStatus) httpParams = httpParams.set('paymentStatus', filters.paymentStatus);
      if (filters.page) httpParams = httpParams.set('page', filters.page.toString());
      if (filters.limit) httpParams = httpParams.set('limit', filters.limit.toString());
    }
    return this.http.get<BookingListResponse>(`${this.baseUrl}/bookings`, {
      params: httpParams,
    });
  }

  getBooking(id: string): Observable<AdminBookingDetail> {
    return this.http.get<AdminBookingDetail>(`${this.baseUrl}/bookings/${id}`);
  }

  updateBookingStatus(
    id: string,
    status: string,
    reason?: string,
  ): Observable<AdminBookingListItem> {
    return this.http.patch<AdminBookingListItem>(
      `${this.baseUrl}/bookings/${id}/status`,
      { status, reason },
    );
  }

  markAttended(id: string): Observable<AdminBookingListItem> {
    return this.http.patch<AdminBookingListItem>(
      `${this.baseUrl}/bookings/${id}/mark-attended`,
      {},
    );
  }

  markNoShow(id: string): Observable<AdminBookingListItem> {
    return this.http.patch<AdminBookingListItem>(
      `${this.baseUrl}/bookings/${id}/mark-no-show`,
      {},
    );
  }

  // -------------------------------------------------------------------------
  // CALENDAR
  // -------------------------------------------------------------------------

  getCalendar(from: string, to: string): Observable<CalendarSession[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarSession[]>(`${this.baseUrl}/calendar`, {
      params,
    });
  }

  // -------------------------------------------------------------------------
  // CUSTOMERS
  // -------------------------------------------------------------------------

  getCustomers(filters?: CustomerListFilters): Observable<CustomerListResponse> {
    let httpParams = new HttpParams();
    if (filters) {
      if (filters.search) httpParams = httpParams.set('search', filters.search);
      if (filters.page) httpParams = httpParams.set('page', filters.page.toString());
      if (filters.limit) httpParams = httpParams.set('limit', filters.limit.toString());
    }
    return this.http.get<CustomerListResponse>(`${this.baseUrl}/customers`, {
      params: httpParams,
    });
  }

  getCustomer(id: string): Observable<AdminCustomerDetail> {
    return this.http.get<AdminCustomerDetail>(`${this.baseUrl}/customers/${id}`);
  }

  addCustomerNote(customerId: string, content: string): Observable<CustomerNote> {
    return this.http.post<CustomerNote>(
      `${this.baseUrl}/customers/${customerId}/notes`,
      { content },
    );
  }

  deleteCustomerNote(noteId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customer-notes/${noteId}`);
  }

  // -------------------------------------------------------------------------
  // FINANCE
  // -------------------------------------------------------------------------

  getFinanceSummary(): Observable<FinanceSummary> {
    return this.http.get<FinanceSummary>(`${this.baseUrl}/finance/summary`);
  }

  getFinancePayments(filters?: FinancePaymentFilters): Observable<FinancePaymentListResponse> {
    let httpParams = new HttpParams();
    if (filters) {
      if (filters.status) httpParams = httpParams.set('status', filters.status);
      if (filters.from) httpParams = httpParams.set('from', filters.from);
      if (filters.to) httpParams = httpParams.set('to', filters.to);
      if (filters.page) httpParams = httpParams.set('page', filters.page.toString());
      if (filters.limit) httpParams = httpParams.set('limit', filters.limit.toString());
    }
    return this.http.get<FinancePaymentListResponse>(`${this.baseUrl}/finance/payments`, {
      params: httpParams,
    });
  }

  getMonthlyStats(months?: number): Observable<MonthlyRevenueStat[]> {
    let httpParams = new HttpParams();
    if (months) httpParams = httpParams.set('months', months.toString());
    return this.http.get<MonthlyRevenueStat[]>(`${this.baseUrl}/finance/monthly-stats`, {
      params: httpParams,
    });
  }

  exportFinanceCSV(from?: string, to?: string): Observable<Blob> {
    let httpParams = new HttpParams();
    if (from) httpParams = httpParams.set('from', from);
    if (to) httpParams = httpParams.set('to', to);
    return this.http.get(`${this.baseUrl}/finance/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }

}
