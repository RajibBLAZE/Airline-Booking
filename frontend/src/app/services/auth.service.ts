import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:3005/api/auth';

  constructor(private http: HttpClient) {}

  register(userData: any) {
    return this.http.post(`${this.API}/register`, userData);
  }

  verifyCode(email: string, code: string) {
    return this.http.post(`${this.API}/verify`, { email, code });
  }

  login(credentials: any) {
    return this.http.post(`${this.API}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.id || null; // 'id' was used in JWT payload
    } catch (err) {
      console.error('Token decode error:', err);
      return null;
    }
  }
}
