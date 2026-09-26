import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User, LoginRequest, RegisterRequest, RegistrationStartedResponse, Role } from '../models/user.model';
import { API_BASE_URL } from '../api.config';

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = API_BASE_URL;
  private readonly TOKEN_KEY = 'news_ai_token';
  private readonly USER_KEY = 'news_ai_user';

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user = signal<User | null>(this.loadUser());

  readonly isLoggedIn = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly role = computed(() => this._user()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  startRegistration(req: RegisterRequest): Observable<RegistrationStartedResponse> {
    return this.http.post<RegistrationStartedResponse>(`${this.API}/auth/register/start`, req);
  }

  verifyRegistration(email: string, code: string): Observable<User> {
    return this.http.post<User>(`${this.API}/auth/register/verify`, { email, code });
  }

  resendRegistrationCode(email: string): Observable<RegistrationStartedResponse> {
    return this.http.post<RegistrationStartedResponse>(`${this.API}/auth/register/resend`, { email });
  }

  login(req: LoginRequest): Observable<User> {
    return this.http.post(`${this.API}/auth/login`, req, { responseType: 'text' }).pipe(
      tap((token: string) => {
        // Store token immediately so the /me request has Authorization header
        localStorage.setItem(this.TOKEN_KEY, token);
        this._token.set(token);
      }),
      switchMap(() => this.http.get<User>(`${this.API}/auth/me`)),
      tap((user: User) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._user.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(...roles: Role[]): boolean {
    const r = this.role();
    return r ? roles.includes(r) : false;
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
