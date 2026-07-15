import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, type Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NewTaskDialogComponent } from '../../components/dialogs/new-task-dialog/new-task-dialog.component';
import { HierarchicalTaskDialogComponent } from '../../components/dialogs/hierarchical-task-dialog/hierarchical-task-dialog.component';
import { type TaskC } from '../../models/task-class';
import { type TaskContainer } from '../../models/interfaces/task-container';
import { NEW_HIERARCHICAL_TASK_DIALOG_OPTIONS, NEW_TASK_DIALOG_OPTIONS } from '../../shared/constants';
import { type EmptyJsonResponse } from '../../shared/libs/task-api.lib';
import { type HandlersNewTaskRequest } from '../../types/generated';
import { ApiService } from '../api.service';
import { DashboardService } from '../dashboard.service';

/** Form value returned by {@link NewTaskDialogComponent}. */
export interface NewTaskDialogResult {
  description: string;
  notes: string;
  markSelected?: boolean;
  /** YYYY-MM-DD or empty when unset */
  dueDate?: string;
}

export interface TaskNode {
  description: string;
  children: TaskNode[];
}

export type EditableTaskNode = {
  description: string;
  children: EditableTaskNode[];
};

export interface HierarchicalTaskDialogResult {
  nodes: TaskNode[];
}

export type CreateHierarchicalTasksRequest = {
  parent: { id: number; type: string };
  nodes: TaskNode[];
};

export function createEmptyEditableTaskNode(): EditableTaskNode {
  return { description: '', children: [] };
}

export function toTaskNode(node: EditableTaskNode): TaskNode | null {
  const description = node.description.trim();
  const children = node.children
    .map(toTaskNode)
    .filter((child): child is TaskNode => child !== null);

  if (!description && children.length === 0) {
    return null;
  }

  return { description, children };
}

export function toTaskNodes(roots: EditableTaskNode[]): TaskNode[] {
  return roots
    .map(toTaskNode)
    .filter((node): node is TaskNode => node !== null);
}

/** Emitted when the add-task dialog is cancelled or already open. */
export type AddTaskDialogSkipped = Record<string, never>;

export type CreateNewTaskRequest = HandlersNewTaskRequest;

/** Convert HTML date input (YYYY-MM-DD) to ISO datetime for the API. */
export function dueDateInputToIso(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toISOString();
}

export type AddTaskToContainerResult = TaskC | AddTaskDialogSkipped;

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  addTaskDialogOpened = false;
  hierarchicalTaskDialogOpened = false;

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

  /** GET /tasks/by-due-date?date=YYYY-MM-DD → open tasks for that day */
  getOpenTasksByDueDate(date: string): Observable<TaskC[]> {
    return this.apiService._getOpenTasksByDueDate(date);
  }

  /** POST /new-hierarchical-tasks → `models.TaskFull[]` */
  createHierarchicalTasks(request: CreateHierarchicalTasksRequest): Observable<TaskC[]> {
    return this.apiService._createHierarchicalTasks(request);
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

  openAddTaskDialog(options?: { markSelectedByDefault?: boolean }): Observable<NewTaskDialogResult | undefined> {
    if (this.addTaskDialogOpened) {
      return EMPTY;
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      data: {
        title: 'Description',
        inputWidth: '40rem',
        markSelectedByDefault: options?.markSelectedByDefault ?? false,
      },
      ...NEW_TASK_DIALOG_OPTIONS,
    });
    return dialogRef.afterClosed();
  }

  openHierarchicalTaskDialog(): Observable<HierarchicalTaskDialogResult | undefined> {
    if (this.hierarchicalTaskDialogOpened) {
      return EMPTY;
    }
    this.hierarchicalTaskDialogOpened = true;
    const dialogRef = this.dialog.open(HierarchicalTaskDialogComponent, {
      ...NEW_HIERARCHICAL_TASK_DIALOG_OPTIONS,
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
            ...(responseObj.dueDate
              ? { dueDateTime: dueDateInputToIso(responseObj.dueDate) }
              : {}),
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
