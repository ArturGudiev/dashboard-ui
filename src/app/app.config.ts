import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxsModule } from "@ngxs/store";
import { AppState } from "./state/app.state";
import { ToastrModule } from "ngx-toastr";
import { provideHttpClient } from "@angular/common/http";
import { HotkeyModule } from "angular2-hotkeys";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(
      NgxsModule.forRoot([AppState]),
      ToastrModule.forRoot(),
      HotkeyModule.forRoot(),
    )
  ]
};
