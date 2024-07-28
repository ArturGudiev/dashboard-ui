import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxsModule } from "@ngxs/store";
import { AppState } from "./state/app.state";
import { ToastrModule } from "ngx-toastr";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(),
    importProvidersFrom(
      NgxsModule.forRoot([AppState]),
      ToastrModule.forRoot()
    )
  ]
};
