import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import {
  type EntLongTaskProgressSubmission,
  type HandlersAddLongTaskProgressSubmissionRequest,
  type ModelsLongTaskProgressSubmission,
} from '../types/generated';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class LongTaskProgressesApiService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  /** POST /long-task-progresses/:id/submissions */
  addSubmission(
    progressId: number,
    body: HandlersAddLongTaskProgressSubmissionRequest,
  ): Observable<EntLongTaskProgressSubmission> {
    return this.http.post<EntLongTaskProgressSubmission>(
      `${this.appConfig.baseUrl}/long-task-progresses/${progressId}/submissions`,
      body,
    );
  }

  /** GET /long-task-progresses/:id/submissions */
  getSubmissions(progressId: number): Observable<ModelsLongTaskProgressSubmission[]> {
    return this.http.get<ModelsLongTaskProgressSubmission[]>(
      `${this.appConfig.baseUrl}/long-task-progresses/${progressId}/submissions`,
    );
  }
}
