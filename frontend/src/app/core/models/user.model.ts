export type Role = 'USER' | 'JOURNALIST' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  bio?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegistrationStartedResponse {
  message: string;
  maskedEmail: string;
  expiresInSeconds: number;
}
