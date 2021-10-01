import { Injectable } from '@angular/core';
import {TaskC} from '../models/taskClass';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {TaskContainer} from "../interfaces/task-container";

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private tasksApiService: ApiService,
              private dashboardService: DashboardService) { }

  getTask(id: number): Observable<TaskC> {
    return this.tasksApiService._getTask(id);
  }

  getParentsPath(task: TaskContainer): Observable<string[]> {
    return this.tasksApiService._getParentsPath(task);
  }

  getTasks(tag: string): Observable<TaskC[]> {
    return this.tasksApiService._getTasks(tag);
  }

  createNewTask(obj: { description: any; tags: string[] }): Observable<TaskC> {
    return this.tasksApiService._createNewTask(obj);
  }

  finishTask(task: TaskC): Observable<TaskC> {
    return this.tasksApiService._finishTask(task).pipe(

      tap({
      complete: () => this.dashboardService.updateDoneTasksNumber()
      })
    );
  }

  finishTasks(tasks: TaskC[]): Observable<any> {
    return this.tasksApiService._finishTasks(tasks).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }
}
