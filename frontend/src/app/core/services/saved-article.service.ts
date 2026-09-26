import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavedArticle, CreateSavedArticleRequest } from '../models/saved-article.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class SavedArticleService {
  private readonly API = `${API_BASE_URL}/saved-articles`;

  constructor(private http: HttpClient) {}

  save(req: CreateSavedArticleRequest): Observable<SavedArticle> {
    return this.http.post<SavedArticle>(this.API, req);
  }

  getByUser(userId: number): Observable<SavedArticle[]> {
    return this.http.get<SavedArticle[]>(`${this.API}/me`);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  checkIfSaved(articleId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API}/check/${articleId}`);
  }

  toggleSave(articleId: number): Observable<{ saved: boolean; message: string }> {
    return this.http.post<{ saved: boolean; message: string }>(`${this.API}/toggle/${articleId}`, {});
  }
}
