import { Injectable } from '@angular/core';
import {Task} from '../models/task-class';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {TaskContainer} from "../interfaces/task-container";

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private apiService: ApiService,
              private dashboardService: DashboardService) { }

  getTask(id: number): Observable<Task> {
    return this.apiService._getTask(id);
  }

  getParentsPath(taskContainer: TaskContainer): Observable<string[]> {
    return this.apiService._getParentsPath(taskContainer);
  }

  getTasks(tag: string): Observable<Task[]> {
    return this.apiService._getTasks(tag);
  }

  createNewTask(obj: { description: any; tags: string[] }): Observable<Task> {
    return this.apiService._createNewTask(obj);
  }

  finishTask(task: Task): Observable<Task> {
    return this.apiService._finishTask(task).pipe(
      tap({
      complete: () => this.dashboardService.updateDoneTasksNumber()
      })
    );
  }

  finishTasks(tasks: Task[]): Observable<any> {
    return this.apiService._finishTasks(tasks).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }

  addAnonymousTask() {
    return this.apiService._addAnonymousTask().pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      })
    );
  }

}
