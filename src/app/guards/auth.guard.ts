import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { type HttpErrorResponse } from '@angular/common/http';
import { map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';
import { isNetworkError } from '../utils/auth.utils';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getMe().pipe(
    map(() => true),
    catchError((error: HttpErrorResponse) => {
      if (isNetworkError(error) && authStore.isAuthenticated()) {
        return of(true);
      }

      return of(
        router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        }),
      );
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
