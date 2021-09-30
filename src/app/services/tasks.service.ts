import { Injectable } from '@angular/core';
import {TaskC} from '../models/taskClass';
import {TasksApiService} from './tasks-api.service';
import {Observable} from 'rxjs';
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private tasksApiService: TasksApiService,
              private dashboardService: DashboardService) { }

  getTask(id: number): Observable<TaskC> {
    return this.tasksApiService._getTask(id);
  }

  getParentsPath(task: TaskC): Observable<string[]> {
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
