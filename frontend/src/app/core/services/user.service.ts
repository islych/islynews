import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.API, user);
  }

  createJournalist(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.API}/journalist`, user);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API}/${id}`, user);
  }

  updateMyBio(bio: string): Observable<User> {
    return this.http.put<User>(`${this.API}/me/bio`, { bio });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
