import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { LoginCredentials, LoginResponse, AuthUser } from '../models';
import { environment } from '../../../environments/Environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  private readonly TOKEN_KEY = 'FronTech';
  private readonly USER_KEY = 'FronTech_user';
  private readonly apiUrl = `${environment.apiUrl}/users/login`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user)); // ✅ guarda usuario
        this.currentUser.set(response.user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
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

    const raw = localStorage.getItem(this.USER_KEY);
    if (raw) {
      this.currentUser.set(JSON.parse(raw)); // ✅ restaura usuario al recargar
    }
  }
}
