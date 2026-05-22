import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, type Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NewTaskDialogComponent } from '../../components/dialogs/new-task-dialog/new-task-dialog.component';
import { type TaskC } from '../../models/task-class';
import { type TaskContainer } from '../../models/interfaces/task-container';
import { NEW_TASK_DIALOG_OPTIONS } from '../../shared/constants';
import { type EmptyJsonResponse } from '../../shared/libs/task-api.lib';
import { type HandlersNewTaskRequest } from '../../types/generated';
import { ApiService } from '../api.service';
import { DashboardService } from '../dashboard.service';

/** Form value returned by {@link NewTaskDialogComponent}. */
export interface NewTaskDialogResult {
  description: string;
  notes: string;
}

/** Emitted when the add-task dialog is cancelled or already open. */
export type AddTaskDialogSkipped = Record<string, never>;

export type CreateNewTaskRequest = HandlersNewTaskRequest;

export type AddTaskToContainerResult = TaskC | AddTaskDialogSkipped;

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  addTaskDialogOpened = false;

  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private dashboardService = inject(DashboardService);

  /** GET /task/:id → `models.TaskFull` */
  getTask(id: number): Observable<TaskC> {
    return this.apiService._getTask(id);
  }

  /** POST /get-tasks → `models.TaskFull[]` */
  getTasks(ids: number[]): Observable<TaskC[]> {
    return this.apiService._getTasks(ids);
  }

  /** POST /new-task → `models.TaskFull` */
  createNewTask(request: CreateNewTaskRequest): Observable<TaskC> {
    return this.apiService._createNewTask(request);
  }

  /** PUT /finish-task/:id → `handlers.TaskResponse` */
  finishTask(task: TaskC): Observable<TaskC> {
    return this.apiService._finishTask(task).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber(),
      }),
    );
  }

  finishTaskById(id: number): Observable<TaskC> {
    return this.apiService._finishTaskById(id).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber(),
      }),
    );
  }

  /** PUT /finish-tasks-by-ids → `{}` */
  finishTasks(tasks: TaskC[]): Observable<EmptyJsonResponse> {
    return this.apiService._finishTasks(tasks).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber(),
      }),
    );
  }

  finishTasksByIds(ids: number[]): Observable<EmptyJsonResponse> {
    return this.apiService._finishTasksByIds(ids).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber(),
      }),
    );
  }

  /** PUT /add-anonymous-task → `ent.Task` */
  addAnonymousTask(): Observable<TaskC> {
    return this.apiService._addAnonymousTask().pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber(),
      }),
    );
  }

  openAddTaskDialog(): Observable<NewTaskDialogResult | undefined> {
    if (this.addTaskDialogOpened) {
      return EMPTY;
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      data: { title: 'Description', inputWidth: '40rem' },
      ...NEW_TASK_DIALOG_OPTIONS,
    });
    return dialogRef.afterClosed();
  }

  openAddTaskDialogToContainer(taskContainer: TaskContainer): Observable<AddTaskToContainerResult> {
    if (this.addTaskDialogOpened) {
      return of({});
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      data: {
        title: 'New task to ' + taskContainer.getFullDescription(),
        inputWidth: '40rem',
      },
      ...NEW_TASK_DIALOG_OPTIONS,
    });
    return dialogRef.afterClosed().pipe(
      switchMap((responseObj: NewTaskDialogResult | undefined) => {
        this.addTaskDialogOpened = false;
        if (!responseObj?.description) {
          return of({});
        }
        const request: HandlersNewTaskRequest = {
          task: {
            description: responseObj.description,
            tags: [],
            notes: responseObj.notes ?? '',
          },
          parent: { id: taskContainer.id, type: taskContainer.type },
        };
        return this.createNewTask(request);
      }),
    );
  }

  /** PUT /update-task → `models.TaskFull` */
  updateTask(task: TaskC): Observable<TaskC> {
    return this.apiService._updateTask(task);
  }
}
