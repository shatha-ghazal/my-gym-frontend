import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  message: string;
  token: string;
}

interface JwtPayload {
  exp?: number;
  role?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // Register a new user
  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      { email, password }
    );
  }

  // Login an existing user
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    );
  }

  // Save JWT token
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get saved JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Decode JWT payload
  private getTokenPayload(): JwtPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const encodedPayload = token.split('.')[1];

      if (!encodedPayload) {
        return null;
      }

      const base64 = encodedPayload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      return JSON.parse(atob(base64)) as JwtPayload;

    } catch {
      return null;
    }
  }

  // Check whether the user is logged in
  isLoggedIn(): boolean {
    const payload = this.getTokenPayload();

    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  // Get the user's role from the JWT
  getRole(): string | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    const payload = this.getTokenPayload();

    const role =
      payload?.role ||
      payload?.[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    return typeof role === 'string' ? role : null;
  }

  // Check whether the user is Admin
  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('gymMembershipStatus');
    localStorage.removeItem('gymMembershipPlan');
  }
}
