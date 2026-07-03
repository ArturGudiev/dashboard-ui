import { type ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ToastrModule } from "ngx-toastr";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { HotkeyModule } from "angular2-hotkeys";
import { provideNgxMask } from "ngx-mask";
import { authInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler((error) => {
        console.error('Navigation error:', error);
        return undefined;
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthService],
      useFactory: (authService: AuthService) => () => authService.initialize(),
    },
    provideNgxMask(),
    importProvidersFrom(
      ToastrModule.forRoot(),
      HotkeyModule.forRoot(),
    )
  ],
};
