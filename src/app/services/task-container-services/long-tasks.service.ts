import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, type Observable } from 'rxjs';
import {
  AddLongTaskDialogComponent,
} from '../../components/dialogs/add-long-task-dialog/add-long-task-dialog.component';
import {
  AddLongTaskSubmissionDialogComponent,
  type AddLongTaskSubmissionDialogData,
} from '../../components/dialogs/add-long-task-submission-dialog/add-long-task-submission-dialog.component';
import {
  type EntLongTask,
  type EntLongTaskSubmission,
  type HandlersAddLongTaskSubmissionRequest,
  type HandlersNewLongTaskRequest,
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
  private addSubmissionDialogOpened = false;

  getAllLongTasks(open?: boolean): Observable<EntLongTask[]> {
    return this.apiService._getAllLongTasks(open);
  }

  getLongTask(id: number): Observable<EntLongTask> {
    return this.apiService._getLongTask(id);
  }

  getSubmissions(longTaskId: number): Observable<EntLongTaskSubmission[]> {
    return this.apiService._getLongTaskSubmissions(longTaskId);
  }

  getParentsPath(id: number): Observable<string[]> {
    return this.apiService._getLongTaskParentsPath(id);
  }

  addNewLongTask(longTask: ModelsLongTaskShort): Observable<EntLongTask> {
    const obj: HandlersNewLongTaskRequest = { longTask };
    return this.apiService._createLongTask(obj);
  }

  addSubmission(longTaskId: number, body: HandlersAddLongTaskSubmissionRequest): Observable<EntLongTaskSubmission> {
    return this.apiService._addLongTaskSubmission(longTaskId, body);
  }

  openAddLongTaskDialog(): Observable<void | null> {
    if (this.addLongTaskDialogOpened) {
      return EMPTY;
    }
    this.addLongTaskDialogOpened = true;
    const dialogRef = this.dialog.open<AddLongTaskDialogComponent, unknown, void | null>(
      AddLongTaskDialogComponent,
      {
        height: '600px',
        width: '1000px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addLongTaskDialogOpened = false;
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
