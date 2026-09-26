import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Like, CreateLikeRequest } from '../models/like.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private readonly API = `${API_BASE_URL}/likes`;

  constructor(private http: HttpClient) {}

  like(req: CreateLikeRequest): Observable<Like> {
    return this.http.post<Like>(this.API, req);
  }

  unlike(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  checkIfLiked(articleId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API}/check/${articleId}`);
  }

  toggleLike(articleId: number): Observable<{ liked: boolean; message: string }> {
    return this.http.post<{ liked: boolean; message: string }>(`${this.API}/toggle/${articleId}`, {});
  }

  getCount(articleId: number): Observable<number> {
    return this.http.get<number>(`${this.API}/count/${articleId}`);
  }
}
