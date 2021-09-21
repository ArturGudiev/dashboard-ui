import { Injectable } from '@angular/core';
import {TaskC} from '../models/taskClass';
import {TasksApiService} from './tasks-api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private tasksApiService: TasksApiService) { }

  getTask(id: number): Observable<TaskC> {
    return this.tasksApiService._getTask(id);
  }

  getParentsPath(task: TaskC) {
    return this.tasksApiService._getParentsPath(task);
  }

  getTasks(tag: string): Observable<TaskC[]> {
    return this.tasksApiService._getTasks(tag);
  }

  createNewTask(obj: { description: any; tags: string[] }): Observable<TaskC> {
    return this.tasksApiService._createNewTask(obj);
  }

  finishTask(task: TaskC): Observable<TaskC> {
    return this.tasksApiService._finishTask(task);
  }

  finishTasks(tasks: TaskC[]): Observable<any> {
    return this.tasksApiService._finishTasks(tasks);
  }
}
