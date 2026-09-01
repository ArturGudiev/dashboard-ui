import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { type Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { AuthRefreshCoordinator } from './auth-refresh-coordinator.service';
import { AuthStore, type AuthUser } from '../state/auth.store';
import { FilesCryptoService } from './files-crypto.service';
import { isNetworkError } from '../utils/auth.utils';

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
  private injector = inject(Injector);
  private refreshCoordinator = inject(AuthRefreshCoordinator);
  private refreshSuppressed = false;
  private forceLogoutInProgress = false;

  constructor() {
    this.refreshCoordinator.onLogout(() => {
      this.suppressRefresh();
      this.clearSession();
      this.redirectToLoginIfNeeded();
    });
  }

  canAttemptRefresh(): boolean {
    return !this.refreshSuppressed;
  }

  suppressRefresh(): void {
    this.refreshSuppressed = true;
  }

  enableRefresh(): void {
    this.refreshSuppressed = false;
  }

  initialize(): Observable<boolean> {
    return this.getMe().pipe(
      map(() => true),
      catchError((error: HttpErrorResponse) => {
        if (isNetworkError(error)) {
          return of(!!this.authStore.user());
        }
        this.clearSession();
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
        tap(() => this.enableRefresh()),
        tap((response) => this.authStore.setUser(response.user)),
        map((response) => response.user),
      );
  }

  refreshToken(): Observable<LoginUserResponse> {
    return this.http
      .post<LoginUserResponse>(`${this.appConfig.baseUrl}/users/refresh`, {}, { withCredentials: true })
      .pipe(tap((response) => this.authStore.setUser(response.user)));
  }

  refreshTokenWithLock(): Observable<void> {
    return this.refreshCoordinator.refreshWithLock(() => this.refreshToken());
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
        catchError(() => of(undefined)),
        tap(() => {
          this.suppressRefresh();
          this.clearSession();
          this.refreshCoordinator.broadcastLogout();
        }),
      );
  }

  forceLogout(returnUrl?: string): Observable<void> {
    if (this.forceLogoutInProgress) {
      return of(undefined);
    }

    this.forceLogoutInProgress = true;
    this.suppressRefresh();

    return this.http
      .post<void>(`${this.appConfig.baseUrl}/users/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(undefined)),
        tap(() => {
          this.refreshCoordinator.broadcastLogout();
          this.clearSession();
          this.redirectToLoginIfNeeded(returnUrl);
        }),
        finalize(() => {
          this.forceLogoutInProgress = false;
        }),
        map(() => undefined),
      );
  }

  clearSession(): void {
    this.authStore.clearUser();
    // Lazy inject to avoid a circular dependency with files services.
    this.injector.get(FilesCryptoService).clearSessionKey();
  }

  redirectToLogin(returnUrl?: string): void {
    this.router.navigate(['/login'], {
      queryParams: returnUrl ? { returnUrl } : undefined,
    });
  }

  private redirectToLoginIfNeeded(returnUrl?: string): void {
    if (this.router.url.startsWith('/login')) {
      return;
    }
    this.redirectToLogin(returnUrl);
  }
}
