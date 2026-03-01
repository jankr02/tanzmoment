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
}
