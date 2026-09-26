import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface ImportedArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  source: string;
  url: string;
  publishedAt: string;
  importedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ImportedArticleService {
  private readonly API = `${API_BASE_URL}/imported-articles`;

  constructor(private http: HttpClient) {}

  getMyImported(): Observable<ImportedArticle[]> {
    return this.http.get<ImportedArticle[]>(`${this.API}/me`);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
