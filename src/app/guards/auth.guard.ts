import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return authService.getMe().pipe(
    map(() => true),
    catchError(() => {
      authService.logoutLocal();
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
