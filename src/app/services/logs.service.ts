import { inject, Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { type TaskContainer } from "../models/interfaces/task-container";
import { type HandlersNewLogMessageRequest, type HandlersPaginatedResponseEntLogMessage } from "../types/generated";
import { type Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  private apiService = inject(ApiService);

  addLogMessage(logMessage: string, taskContainer: TaskContainer | undefined, logType: string) {
    const args: HandlersNewLogMessageRequest = taskContainer
      ? { description: logMessage, containerID: taskContainer.id, containerType: taskContainer.type }
      : { description: logMessage };
    if (logType) {
      args['logType'] = logType;
    }
    return this.apiService.addLogMessage(args);
  }

  getLogMessages(props: { taskContainer?: TaskContainer, perPage?: number, page?: number, global?: boolean } ): Observable<HandlersPaginatedResponseEntLogMessage> {
    return this.apiService.getLogMessages( props );
  }
}
