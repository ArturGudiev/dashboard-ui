import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { type TaskContainer } from '../models/interfaces/task-container';
import {
  type DeleteContainerChecksByIdResponse,
  type HandlersAddContainerCheckRequest,
  type HandlersPatchContainerCheckRequest,
  type ModelsContainerCheck,
} from '../types/generated';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ContainerChecksApiService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  addCheck(
    taskContainer: TaskContainer,
    description: string,
  ): Observable<ModelsContainerCheck> {
    const body: HandlersAddContainerCheckRequest = {
      containerID: taskContainer.id,
      containerType: taskContainer.type,
      description,
    };

    return this.http.post<ModelsContainerCheck>(
      `${this.appConfig.baseUrl}/container-checks`,
      body,
    );
  }

  patchCheck(id: number, description: string): Observable<ModelsContainerCheck> {
    const body: HandlersPatchContainerCheckRequest = { description };

    return this.http.patch<ModelsContainerCheck>(
      `${this.appConfig.baseUrl}/container-checks/${id}`,
      body,
    );
  }

  deleteCheck(id: number): Observable<DeleteContainerChecksByIdResponse> {
    return this.http.delete<DeleteContainerChecksByIdResponse>(
      `${this.appConfig.baseUrl}/container-checks/${id}`,
    );
  }
}
