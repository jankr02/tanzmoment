import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminNewsArticle,
  AdminNewsListQuery,
  CreateNewsArticleRequest,
  NewsletterCampaign,
  PaginatedAdminNews,
  SendNewsletterRequest,
  TestSendNewsletterRequest,
  UpdateNewsArticleRequest,
  UploadResponse,
} from '../types/news.types';

@Injectable({ providedIn: 'root' })
export class AdminNewsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/news';
  private readonly campaignsUrl = '/api/admin/campaigns';
  private readonly uploadsUrl = '/api/admin/uploads';

  list(query: AdminNewsListQuery = {}): Observable<PaginatedAdminNews> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));
    if (query.status) params = params.set('status', query.status);
    if (query.search) params = params.set('search', query.search);
    return this.http.get<PaginatedAdminNews>(this.baseUrl, { params });
  }

  get(id: string): Observable<AdminNewsArticle> {
    return this.http.get<AdminNewsArticle>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateNewsArticleRequest): Observable<AdminNewsArticle> {
    return this.http.post<AdminNewsArticle>(this.baseUrl, data);
  }

  update(id: string, data: UpdateNewsArticleRequest): Observable<AdminNewsArticle> {
    return this.http.patch<AdminNewsArticle>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  togglePublish(id: string): Observable<AdminNewsArticle> {
    return this.http.patch<AdminNewsArticle>(`${this.baseUrl}/${id}/publish`, {});
  }

  testSend(id: string, payload: TestSendNewsletterRequest): Observable<NewsletterCampaign> {
    return this.http.post<NewsletterCampaign>(`${this.baseUrl}/${id}/test-send`, payload);
  }

  send(id: string, payload: SendNewsletterRequest): Observable<NewsletterCampaign> {
    return this.http.post<NewsletterCampaign>(`${this.baseUrl}/${id}/send`, payload);
  }

  listCampaigns(id: string): Observable<NewsletterCampaign[]> {
    return this.http.get<NewsletterCampaign[]>(`${this.baseUrl}/${id}/campaigns`);
  }

  cancelCampaign(campaignId: string): Observable<NewsletterCampaign> {
    return this.http.post<NewsletterCampaign>(`${this.campaignsUrl}/${campaignId}/cancel`, {});
  }

  uploadCover(file: File): Observable<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResponse>(`${this.uploadsUrl}/news-cover`, form);
  }

  uploadInline(file: File): Observable<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResponse>(`${this.uploadsUrl}/news-image`, form);
  }
}
