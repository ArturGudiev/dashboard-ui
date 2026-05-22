import { inject, Injectable } from '@angular/core';
import { EMPTY, type Observable } from "rxjs";
import { ApiService } from "../api.service";
import {
  type EntRepetitiveTaskExecution,
  type HandlersNewRepetitiveTaskRequest,
  type ModelsRepetitiveTaskResponse,
  type ModelsRepetitiveTaskShort
} from "../../types/generated";
import {
  AddRepetitiveTaskDialogComponent
} from "../../components/dialogs/add-repetitive-task-dialog/add-repetitive-task-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class RepetitiveTasksService {
  private dialog =  inject(MatDialog);
  private apiService = inject(ApiService);
  private addRepetitiveTaskDialogOpened = false;

  getAllRepetitiveTasks(): Observable<ModelsRepetitiveTaskResponse[]> {
    return this.apiService._getAllRepetitiveTasks();
  }

  markTaskAsDone(id: number): Observable<EntRepetitiveTaskExecution> {
    return this.apiService._markRepetitiveTaskAsDone(id);
  }

  addNewRepetitiveTask(repetitiveTask: ModelsRepetitiveTaskShort): Observable<EntRepetitiveTaskExecution> {
    const obj: HandlersNewRepetitiveTaskRequest = { repetitiveTask };
    return this.apiService._createRepetitiveTask(obj);
  }

  /**
   *  Open dialog to add a new repetitive task
   */
  openAddRepetitiveTaskDialog(): Observable<void | null> {
    if (this.addRepetitiveTaskDialogOpened) {
      return EMPTY;
    }
    this.addRepetitiveTaskDialogOpened = true;
    const dialogRef = this.dialog.open<AddRepetitiveTaskDialogComponent, unknown, void | null>(
      AddRepetitiveTaskDialogComponent,
      {
        height: '600px',
        width: '1000px',
      }
    );
    return dialogRef.afterClosed();
  }
}
