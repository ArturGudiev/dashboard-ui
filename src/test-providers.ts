import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';

export default [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideNoopAnimations(),
  provideNgxMask(),
];
