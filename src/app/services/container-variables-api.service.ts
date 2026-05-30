import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { type TaskContainer } from '../models/interfaces/task-container';
import {
  type DeleteContainerVariablesByIdResponse,
  type EntContainerVariables,
  type HandlersAddContainerVariableRequest,
} from '../types/generated';
import { AppConfigService } from './app-config.service';

export interface PatchContainerVariableRequest {
  variableName: string;
  variableValue: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContainerVariablesApiService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  addVariable(
    taskContainer: TaskContainer,
    variableName: string,
    variableValue: string,
  ): Observable<EntContainerVariables> {
    const body: HandlersAddContainerVariableRequest = {
      containerID: taskContainer.id,
      containerType: taskContainer.type,
      variableName,
      variableValue,
    };

    return this.http.post<EntContainerVariables>(
      `${this.appConfig.baseUrl}/container-variables`,
      body,
    );
  }

  patchVariable(
    id: number,
    variableName: string,
    variableValue: string,
  ): Observable<EntContainerVariables> {
    const body: PatchContainerVariableRequest = { variableName, variableValue };

    return this.http.patch<EntContainerVariables>(
      `${this.appConfig.baseUrl}/container-variables/${id}`,
      body,
    );
  }

  deleteVariable(id: number): Observable<DeleteContainerVariablesByIdResponse> {
    return this.http.delete<DeleteContainerVariablesByIdResponse>(
      `${this.appConfig.baseUrl}/container-variables/${id}`,
    );
  }
}
