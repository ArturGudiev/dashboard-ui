import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    __env?: { API_BASE_URL?: string; API_HOST?: string; API_PORT?: string };
  }
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private _baseUrl: string;

  constructor() {
    const base = window.__env?.API_BASE_URL;
    if (base != null && base !== '') {
      this._baseUrl = base.replace(/\/$/, '');
    } else if ('useProxy' in environment && environment.useProxy) {
      // Same-origin /api prefix; ng serve proxy (and Nginx in Docker) strip it.
      this._baseUrl = '/api';
    } else {
      const host = window.__env?.API_HOST ?? environment.API_HOST;
      const port = window.__env?.API_PORT ?? environment.API_PORT;
      this._baseUrl = port ? `${host}:${port}` : host;
    }
  }

  get baseUrl(): string {
    return this._baseUrl;
  }
}
