import { Injectable } from '@angular/core';
import { Observable, of, Subject } from "rxjs";
import { ApiService } from "./api.service";
import { TasksService } from './tasks.service';
import { ProblemsService } from './problems.service';
import { QuestionsService } from './questions.service';
import { TaskContainer } from "../models/interfaces/task-container";
import { TaskContainerType } from "../models/interfaces/types";

@Injectable({
  providedIn: 'root'
})
export class TaskContainerService {

  refreshSubtasks$ = new Subject<TaskContainer>();

  constructor(
    private apiService: ApiService,
    private tasksService: TasksService,
    private problemsService: ProblemsService,
    private questionsService: QuestionsService,
  )
    { }


  getQuestionParentsPath(taskContainer: TaskContainer) {
    return this.apiService._getParentsPath(taskContainer);
  }


  getParentsPath(taskContainer: TaskContainer): Observable<string[]> {
    return this.apiService._getParentsPath(taskContainer);
  }

  getTaskContainer(type: TaskContainerType, id: number): Observable<TaskContainer | null> {
    switch(type) {
      case 'task':
        return this.tasksService.getTask(id);
      case 'problem':
        return this.problemsService.getProblem(id);
      case 'question':
        return this.questionsService.getQuestion(id);
      default:
        return of(null);
    }
  }

}
