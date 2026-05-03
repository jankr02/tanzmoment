import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NewsListQuery,
  PaginatedPublicNews,
  PublicNewsArticle,
} from '../types/news.types';

@Injectable({ providedIn: 'root' })
export class NewsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/news';

  list(query: NewsListQuery = {}): Observable<PaginatedPublicNews> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));
    if (query.category) params = params.set('category', query.category);
    return this.http.get<PaginatedPublicNews>(this.baseUrl, { params });
  }

  getBySlug(slug: string): Observable<PublicNewsArticle> {
    return this.http.get<PublicNewsArticle>(`${this.baseUrl}/${slug}`);
  }
}
