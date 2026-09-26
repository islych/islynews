import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, CreateArticleRequest } from '../models/article.model';
import { ArticleAnalysis } from './external-news.service';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly API = `${API_BASE_URL}/articles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.API);
  }

  getMyArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.API}/my-articles`);
  }

  getAdminArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.API}/admin/all`);
  }

  getReviewQueue(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.API}/review-queue`);
  }

  getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.API}/${id}`);
  }

  getSummary(id: number): Observable<string> {
    return this.http.get(`${this.API}/${id}/summary`, { responseType: 'text' });
  }

  create(article: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(this.API, article);
  }

  getAnalysis(id: number): Observable<ArticleAnalysis> {
    return this.http.get<ArticleAnalysis>(`${this.API}/${id}/analysis`);
  }

  getRelated(id: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.API}/${id}/related`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const data = new FormData();
    data.append('file', file);
    return this.http.post<{ url: string }>(`${API_BASE_URL}/uploads/images`, data);
  }

  update(id: number, article: Partial<CreateArticleRequest>): Observable<Article> {
    return this.http.put<Article>(`${this.API}/${id}`, article);
  }

  submitForReview(id: number): Observable<Article> {
    return this.http.post<Article>(`${this.API}/${id}/submit`, {});
  }

  approve(id: number): Observable<Article> {
    return this.http.post<Article>(`${this.API}/${id}/approve`, {});
  }

  reject(id: number, reason: string): Observable<Article> {
    return this.http.post<Article>(`${this.API}/${id}/reject`, { reason });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
