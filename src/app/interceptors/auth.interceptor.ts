import { type HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';

let isRefreshing = false;
const refreshResult$ = new BehaviorSubject<boolean | null>(null);

function shouldSkipAuth(url: string): boolean {
  const path = url.split('?')[0];
  return (
    path.endsWith('/users/login') ||
    path.endsWith('/users/refresh') ||
    path.endsWith('/users/logout') ||
    /\/users$/.test(path)
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const authReq = req.clone({ withCredentials: true });

  if (shouldSkipAuth(authReq.url)) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 403 || shouldSkipAuth(authReq.url) || !authStore.isAuthenticated()) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshResult$.next(null);

        return authService.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            refreshResult$.next(true);
            return next(authReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshResult$.next(false);
            authService.logoutLocal();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      return refreshResult$.pipe(
        filter((result): result is boolean => result !== null),
        take(1),
        switchMap((result) => {
          if (!result) {
            return throwError(() => error);
          }
          return next(authReq);
        }),
      );
    }),
  );
};
