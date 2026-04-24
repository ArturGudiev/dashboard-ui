import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxsModule } from "@ngxs/store";
import { AppState } from "./state/app.state";
import { ToastrModule } from "ngx-toastr";
import { provideHttpClient } from "@angular/common/http";
import { HotkeyModule } from "angular2-hotkeys";
import { provideNgxMask } from "ngx-mask";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withNavigationErrorHandler((error) => {
        // Handles router navigation failures (e.g. errors while loading a route/resolver/guard).
        console.error('Navigation error:', error);
        return undefined;
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideNgxMask(),
    importProvidersFrom(
      NgxsModule.forRoot([AppState]),
      ToastrModule.forRoot(),
      HotkeyModule.forRoot(),
    )
  ],
};
