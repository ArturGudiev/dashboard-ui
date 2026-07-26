import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { type TaskContainer } from '../models/interfaces/task-container';
import { type ModelsAliasModel } from '../types/generated';
import { AppConfigService } from './app-config.service';

export interface UpdateContainerAliasesRequest {
  containerType: string;
  containerID: number;
  aliases: string[];
}

export interface UpdateFileAliasesRequest {
  filePath: string;
  aliases: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AliasesService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  getAliasRecord(alias: string): Observable<ModelsAliasModel> {
    return this.http.get<ModelsAliasModel>(`${this.appConfig.baseUrl}/aliases/${alias}`);
  }

  getContainerAliases(taskContainer: TaskContainer): Observable<ModelsAliasModel[]> {
    return this.http.get<ModelsAliasModel[]>(
      `${this.appConfig.baseUrl}/aliases/container/${taskContainer.type}/${taskContainer.id}`,
    );
  }

  updateContainerAliases(
    taskContainer: TaskContainer,
    aliases: string[],
  ): Observable<ModelsAliasModel[]> {
    const body: UpdateContainerAliasesRequest = {
      containerType: taskContainer.type,
      containerID: taskContainer.id,
      aliases,
    };

    return this.http.put<ModelsAliasModel[]>(
      `${this.appConfig.baseUrl}/aliases/container`,
      body,
    );
  }

  getFileAliases(relativePath: string): Observable<ModelsAliasModel[]> {
    const encoded = this.encodeRelativePath(relativePath);
    return this.http.get<ModelsAliasModel[]>(
      `${this.appConfig.baseUrl}/aliases/file/${encoded}`,
    );
  }

  updateFileAliases(relativePath: string, aliases: string[]): Observable<ModelsAliasModel[]> {
    const body: UpdateFileAliasesRequest = {
      filePath: relativePath,
      aliases,
    };

    return this.http.put<ModelsAliasModel[]>(
      `${this.appConfig.baseUrl}/aliases/file`,
      body,
    );
  }

  private encodeRelativePath(relativePath: string): string {
    return relativePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }
}
