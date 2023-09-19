import { Injectable } from '@angular/core';
import {TaskC} from '../models/task-class';
import {ApiService} from './api.service';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {concatMap, tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {TaskContainer} from "../interfaces/task-container";
import {NEW_TASK_DIALOG_OPTIONS} from "../shared/constants";
import {MatDialog} from "@angular/material/dialog";
import {NewTaskDialogComponent} from "../modules/tasks/new-task-dialog/new-task-dialog.component";
import {TaskContainerDescription} from "../interfaces/types";

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
  addTaskDialogOpened = false;

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

  getTasks(ids: number[]): Observable<TaskC[]> {
    return this.apiService._getTasks(ids);
  }

  createNewTask(obj: any): Observable<TaskC> {
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

  /**
   *
   * @param taskContainer
   * @param callback is called when create new task is finished
   */
  openAddTaskDialog(taskContainer: TaskContainer): Observable<any> {
    if (this.addTaskDialogOpened) {
      return EMPTY;
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_TASK_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed();
  }


  /**
   *
   * @param taskContainer
   * @param callback is called when create new task is finished
   */
  openAddTaskDialog2(taskContainer: TaskContainer, callback: () => Observable<any> = () => EMPTY): void {
    if (this.addTaskDialogOpened) {
      return;
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_TASK_DIALOG_OPTIONS
      });
    dialogRef.afterClosed().subscribe((responseObj: any) => {
      this.addTaskDialogOpened = false;
      if (!responseObj) {
        return;
      }
      const description = responseObj.description;
      if (description) {
        const obj: any = {description: description, tags: [],
          notes: responseObj.notes,
            parents: [taskContainer.getTaskContainerDescription()]
        }
        const state = this.getRefreshTasksDataCurrentState();
        this.createNewTask(obj)
          .pipe(
            concatMap(() => callback())
          )
          .subscribe(() => this.setRefreshTasksDataState({...state, taskContainer: taskContainer}))
      }
    });
  }

  updateTask(task: TaskC): Observable<TaskC> {
    return this.apiService._updateTask(task)
  }
}
