import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Login.
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  // Register.
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  // Get token.
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? true : false;
  }

  // Get headers.
  getHeaders() {
    const token = localStorage.getItem('token');
    console.log('Le token présent dans getHeaders :', token);
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Get user ID.
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
}
