import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import {
  type ScriptFull,
  type ScriptListItem,
  type ScriptListQuery,
  type ScriptPartial,
  type ScriptRunResponse,
  type ScriptShort,
  type ScriptValidateResponse,
} from '../models/script';
import { type TaskContainer } from '../models/interfaces/task-container';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ScriptsApiService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  list(query: ScriptListQuery | string = {}): Observable<ScriptListItem[]> {
    const opts: ScriptListQuery = typeof query === 'string' ? { q: query } : query;
    let params = new HttpParams();
    if (opts.q?.trim()) {
      params = params.set('q', opts.q.trim());
    }
    if (opts.scope) {
      params = params.set('scope', opts.scope);
    }
    if (opts.containerType) {
      params = params.set('containerType', opts.containerType);
    }
    if (opts.containerId && opts.containerId > 0) {
      params = params.set('containerId', String(opts.containerId));
    }
    return this.http.get<ScriptListItem[]>(`${this.appConfig.baseUrl}/scripts`, { params });
  }

  listForContainer(
    container: TaskContainer,
    scope: 'all' | 'global' | 'local' = 'local',
    q = '',
  ): Observable<ScriptListItem[]> {
    return this.list({
      q,
      scope,
      containerType: container.type,
      containerId: container.id,
    });
  }

  get(id: number): Observable<ScriptFull> {
    return this.http.get<ScriptFull>(`${this.appConfig.baseUrl}/scripts/${id}`);
  }

  create(script: ScriptShort): Observable<ScriptFull> {
    return this.http.post<ScriptFull>(`${this.appConfig.baseUrl}/scripts`, script);
  }

  update(id: number, patch: ScriptPartial): Observable<ScriptFull> {
    return this.http.patch<ScriptFull>(`${this.appConfig.baseUrl}/scripts/${id}`, patch);
  }

  delete(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${this.appConfig.baseUrl}/scripts/${id}`);
  }

  validate(code: string): Observable<ScriptValidateResponse> {
    return this.http.post<ScriptValidateResponse>(`${this.appConfig.baseUrl}/scripts/validate`, { code });
  }

  run(
    id: number,
    container: TaskContainer,
    params: Record<string, unknown>,
  ): Observable<ScriptRunResponse> {
    return this.http.post<ScriptRunResponse>(`${this.appConfig.baseUrl}/scripts/${id}/run`, {
      container: { id: container.id, type: container.type },
      params,
    });
  }
}
