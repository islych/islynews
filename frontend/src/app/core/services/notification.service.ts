import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = `${API_BASE_URL}/notifications`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.API);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API}/unread-count`);
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.API}/read-all`, {});
  }
}
