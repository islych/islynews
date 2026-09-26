import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats } from '../models/admin.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = `${API_BASE_URL}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API}/stats`);
  }
}
