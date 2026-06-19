import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, type Observable, forkJoin, of } from 'rxjs';
import {
  AddLongTaskDialogComponent,
} from '../../components/dialogs/add-long-task-dialog/add-long-task-dialog.component';
import {
  AddLongTaskProgressDialogComponent,
  type AddLongTaskProgressDialogData,
} from '../../components/dialogs/add-long-task-progress-dialog/add-long-task-progress-dialog.component';
import {
  AddLongTaskProgressSubmissionDialogComponent,
  type AddLongTaskProgressSubmissionDialogData,
} from '../../components/dialogs/add-long-task-progress-submission-dialog/add-long-task-progress-submission-dialog.component';
import {
  AddLongTaskSubmissionDialogComponent,
  type AddLongTaskSubmissionDialogData,
} from '../../components/dialogs/add-long-task-submission-dialog/add-long-task-submission-dialog.component';
import {
  type ModelsLongTaskFull,
  type ModelsLongTaskProgress,
  type ModelsLongTaskProgressSubmission,
  type EntLongTask,
  type EntLongTaskProgress,
  type EntLongTaskProgressSubmission,
  type EntLongTaskSubmission,
  type HandlersAddLongTaskProgressRequest,
  type HandlersAddLongTaskProgressSubmissionRequest,
  type HandlersAddLongTaskSubmissionRequest,
  type HandlersNewLongTaskRequest,
  type ModelsContainerDescription,
  type ModelsLongTaskShort,
} from '../../types/generated';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class LongTasksService {
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);
  private addLongTaskDialogOpened = false;
  private addProgressDialogOpened = false;
  private addProgressSubmissionDialogOpened = false;
  private addSubmissionDialogOpened = false;

  getAllLongTasks(open?: boolean): Observable<ModelsLongTaskFull[]> {
    return this.apiService._getAllLongTasks(open);
  }

  getLongTask(id: number): Observable<ModelsLongTaskFull> {
    return this.apiService._getLongTask(id);
  }

  getLongTasksByIds(ids: number[]): Observable<ModelsLongTaskFull[]> {
    if (!ids.length) {
      return of([]);
    }
    return forkJoin(ids.map((id) => this.apiService._getLongTask(id)));
  }

  getSubmissions(longTaskId: number): Observable<ModelsLongTaskProgressSubmission[]> {
    return this.apiService._getLongTaskSubmissions(longTaskId);
  }

  getParentsPath(id: number): Observable<string[]> {
    return this.apiService._getLongTaskParentsPath(id);
  }

  addNewLongTask(longTask: ModelsLongTaskShort, parent?: ModelsContainerDescription): Observable<EntLongTask> {
    const obj: HandlersNewLongTaskRequest = { longTask, parent };
    return this.apiService._createLongTask(obj);
  }

  addSubmission(longTaskId: number, body: HandlersAddLongTaskSubmissionRequest): Observable<EntLongTaskSubmission> {
    return this.apiService._addLongTaskSubmission(longTaskId, body);
  }

  addProgress(longTaskId: number, body: HandlersAddLongTaskProgressRequest): Observable<EntLongTaskProgress> {
    return this.apiService._addLongTaskProgress(longTaskId, body);
  }

  addProgressSubmission(
    progressId: number,
    body: HandlersAddLongTaskProgressSubmissionRequest,
  ): Observable<EntLongTaskProgressSubmission> {
    return this.apiService._addLongTaskProgressSubmission(progressId, body);
  }

  openAddLongTaskDialog(parent?: ModelsContainerDescription): Observable<void | null> {
    if (this.addLongTaskDialogOpened) {
      return EMPTY;
    }
    this.addLongTaskDialogOpened = true;
    const dialogRef = this.dialog.open<AddLongTaskDialogComponent, ModelsContainerDescription | null, void | null>(
      AddLongTaskDialogComponent,
      {
        data: parent ?? null,
        height: '600px',
        width: '1000px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addLongTaskDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }

  openAddProgressDialog(longTaskId: number): Observable<void | null> {
    if (this.addProgressDialogOpened) {
      return EMPTY;
    }
    this.addProgressDialogOpened = true;
    const dialogData: AddLongTaskProgressDialogData = { longTaskId };
    const dialogRef = this.dialog.open<AddLongTaskProgressDialogComponent, AddLongTaskProgressDialogData, void | null>(
      AddLongTaskProgressDialogComponent,
      {
        data: dialogData,
        width: '500px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addProgressDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }

  openAddProgressSubmissionDialog(progress: ModelsLongTaskProgress): Observable<void | null> {
    if (this.addProgressSubmissionDialogOpened) {
      return EMPTY;
    }
    this.addProgressSubmissionDialogOpened = true;
    const dialogData: AddLongTaskProgressSubmissionDialogData = { progress };
    const dialogRef = this.dialog.open<
      AddLongTaskProgressSubmissionDialogComponent,
      AddLongTaskProgressSubmissionDialogData,
      void | null
    >(
      AddLongTaskProgressSubmissionDialogComponent,
      {
        data: dialogData,
        width: '500px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addProgressSubmissionDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }

  openAddSubmissionDialog(longTask: EntLongTask): Observable<void | null> {
    if (this.addSubmissionDialogOpened) {
      return EMPTY;
    }
    this.addSubmissionDialogOpened = true;
    const dialogData: AddLongTaskSubmissionDialogData = {
      longTaskId: longTask.id!,
      longTask,
    };
    const dialogRef = this.dialog.open<AddLongTaskSubmissionDialogComponent, AddLongTaskSubmissionDialogData, void | null>(
      AddLongTaskSubmissionDialogComponent,
      {
        data: dialogData,
        width: '500px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addSubmissionDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }
}
