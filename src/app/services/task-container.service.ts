import { Injectable } from '@angular/core';
import {TaskContainer} from "../interfaces/task-container";
import { Observable, of, Subject } from "rxjs";
import {ApiService} from "./api.service";
import { Question } from '../models/question';
import { TaskContainerType } from '../interfaces/types';
import { TasksService } from './tasks.service';
import { ProblemsService } from './problems.service';
import { QuestionsService } from './questions.service';

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
