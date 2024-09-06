import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { switchMap, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "../api.service";
import { DashboardService } from "../dashboard.service";
import { TaskC } from "../../models/task-class";
import { NewTaskDialogComponent } from "../../components/dialogs/new-task-dialog/new-task-dialog.component";
import { NEW_TASK_DIALOG_OPTIONS } from "../../shared/constants";
import { TaskContainer } from "../../models/interfaces/task-container";

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  addTaskDialogOpened = false;

  constructor(private apiService: ApiService,
    private dialog: MatDialog,
    private dashboardService: DashboardService) { }


  getTask(id: number): Observable<TaskC> {
    return this.apiService._getTask(id);
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

  finishTaskById(id: number): Observable<TaskC> {
    return this.apiService._finishTaskById(id).pipe(
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

  finishTasksByIds(tasks: number[]): Observable<any> {
    return this.apiService._finishTasksByIds(tasks).pipe(
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
  openAddTaskDialog(): Observable<any> {
    if (this.addTaskDialogOpened) {
      return EMPTY;
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: { title: 'Description', inputWidth: '40rem' },
        ...NEW_TASK_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed();
  }


  /**
   *
   * @param taskContainer
   * @param callback is called when create new task is finished
   */
  openAddTaskDialogToContainer(taskContainer: TaskContainer): Observable<any> {
    if (this.addTaskDialogOpened) {
      return of({});
    }
    this.addTaskDialogOpened = true;
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {
          title: 'New task to ' + taskContainer.getFullDescription(),
          inputWidth: '40rem'
        },
        ...NEW_TASK_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed()
      .pipe(
        switchMap((responseObj: any) => {
          this.addTaskDialogOpened = false;
          if (!responseObj) {
            return of({});
          }
          const description = responseObj.description;
          if (description) {
            const obj: any = {
              description: description,
              tags: [],
              done: false,
              notes: responseObj.notes,
              parents: [taskContainer.getTaskContainerDescription()]
            }
            return this.createNewTask(obj);
          }
          return of({});
        })
      )
  }

  updateTask(task: TaskC): Observable<TaskC> {
    return this.apiService._updateTask(task)
  }
}
