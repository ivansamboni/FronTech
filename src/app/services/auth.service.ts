import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { LoginCredentials, LoginResponse, AuthUser } from '../models';
import { environment } from '../../environments/Environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  private readonly TOKEN_KEY = 'FronTech';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage();
  }

  // login(credentials: LoginCredentials): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
  //     tap(response => {
  //       localStorage.setItem(this.TOKEN_KEY, response.token);
  //       this.currentUser.set(response.user);
  //     })
  //   );
  // }
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const fakeResponse: LoginResponse = {
      token: 'fake-token-123',
      user: {
        id: 1,
        name: 'Dr. Ana García',
        email: credentials.email,
        role: 'veterinarian',
      },
    };
    localStorage.setItem(this.TOKEN_KEY, fakeResponse.token);
    this.currentUser.set(fakeResponse.user);
    return of(fakeResponse);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (!token) return;
  }
}
