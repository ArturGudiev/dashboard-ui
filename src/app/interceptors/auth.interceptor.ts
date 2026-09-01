import { type HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { isAuthFailure, isNetworkError } from '../utils/auth.utils';

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

  const authReq = req.clone({ withCredentials: true });

  if (shouldSkipAuth(authReq.url)) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 403 || shouldSkipAuth(authReq.url) || !authService.canAttemptRefresh()) {
        return throwError(() => error);
      }

      return authService.refreshTokenWithLock().pipe(
        switchMap(() => next(authReq)),
        catchError((refreshError) => {
          if (isNetworkError(refreshError)) {
            return throwError(() => refreshError);
          }

          if (isAuthFailure(refreshError)) {
            return authService.forceLogout().pipe(switchMap(() => throwError(() => refreshError)));
          }

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
