import { Injectable } from '@angular/core';
import {TaskC} from '../models/task-class';
import {ApiService} from './api.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {TaskContainer} from "../interfaces/task-container";
import {GetValueDialogComponent} from "../modules/dialogs/get-value/get-value-dialog.component";
import {NEW_TASK_DIALOG_OPTIONS} from "../shared/constants";
import {MatDialog} from "@angular/material/dialog";

export interface RefreshTasksState {
  taskContainer: TaskContainer;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private initialRefreshTasksState: RefreshTasksState = {
    taskContainer: null
  }
  private refreshTasksState = new BehaviorSubject<RefreshTasksState>(this.initialRefreshTasksState);

  constructor(private apiService: ApiService,
              private dialog: MatDialog,
              private dashboardService: DashboardService) { }


  getRefreshTasksDataCurrentState(): RefreshTasksState {
    return this.refreshTasksState.getValue();
  }

  getRefreshTasksDataStateChange(): Observable<RefreshTasksState> {
    return this.refreshTasksState.asObservable();
  }

  setRefreshTasksDataState(state: RefreshTasksState): void {
    this.refreshTasksState.next(state);
  }

  getTask(id: number): Observable<TaskC> {
    return this.apiService._getTask(id);
  }

  getParentsPath(taskContainer: TaskContainer): Observable<string[]> {
    return this.apiService._getParentsPath(taskContainer);
  }

  getTasks(tag: string): Observable<TaskC[]> {
    return this.apiService._getTasks(tag);
  }

  createNewTask(obj: { description: any; tags: string[] }): Observable<TaskC> {
    return this.apiService._createNewTask(obj);
  }

  finishTask(task: TaskC): Observable<TaskC> {
    return this.apiService._finishTask(task).pipe(
      tap({
      complete: () => this.dashboardService.updateDoneTasksNumber()
      })
    );
  }

  finishTasks(tasks: TaskC[]): Observable<any> {
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

  openAddTaskDialog(taskContainer: TaskContainer): void {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_TASK_DIALOG_OPTIONS
      });
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const obj = {description: description, tags: [taskContainer.getFullDescription()]}
        const state = this.getRefreshTasksDataCurrentState();
        this.createNewTask(obj).subscribe(() =>
          this.setRefreshTasksDataState({...state, taskContainer: taskContainer}));
      }
    });
  }
}
