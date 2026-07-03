import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { type Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { AuthStore, type AuthUser } from '../state/auth.store';

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  initialize(): Observable<boolean> {
    return this.getMe().pipe(
      map(() => true),
      catchError(() => {
        this.authStore.clearUser();
        return of(false);
      }),
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginUserResponse>(`${this.appConfig.baseUrl}/users/login`, { email, password }, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.authStore.setUser(response.user)),
        map((response) => response.user),
      );
  }

  refreshToken(): Observable<LoginUserResponse> {
    return this.http
      .post<LoginUserResponse>(`${this.appConfig.baseUrl}/users/refresh`, {}, { withCredentials: true })
      .pipe(tap((response) => this.authStore.setUser(response.user)));
  }

  getMe(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.appConfig.baseUrl}/users/me`, { withCredentials: true })
      .pipe(tap((user) => this.authStore.setUser(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.appConfig.baseUrl}/users/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.logoutLocal()),
        catchError(() => {
          this.logoutLocal();
          return of(undefined);
        }),
      );
  }

  logoutLocal(): void {
    this.authStore.clearUser();
  }

  redirectToLogin(returnUrl?: string): void {
    this.router.navigate(['/login'], {
      queryParams: returnUrl ? { returnUrl } : undefined,
    });
  }
}
