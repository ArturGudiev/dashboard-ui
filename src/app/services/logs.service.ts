import { Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { TaskContainer } from "../models/interfaces/task-container";
import { HandlersNewLogMessageRequest, HandlersPaginatedResponseEntLogMessage } from "../types/generated";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(private apiService: ApiService) { }

  addLogMessage(logMessage: string, taskContainer?: TaskContainer) {
    const args: HandlersNewLogMessageRequest = taskContainer
      ? { description: logMessage, containerID: taskContainer.id, containerType: taskContainer.type }
      : { description: logMessage };
    return this.apiService.addLogMessage(args);
  }

  getLogMessages(props: { taskContainer?: TaskContainer, perPage?: number, page?: number, global?: boolean } ): Observable<HandlersPaginatedResponseEntLogMessage> {
    return this.apiService.getLogMessages( props );
  }
}
