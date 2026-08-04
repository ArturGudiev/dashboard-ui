import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { type Observable } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
import { NewTaskDialogComponent } from '../../components/dialogs/new-task-dialog/new-task-dialog.component';
import { type Epic } from "../../models/epic";
import { type TaskContainer } from '../../models/interfaces/task-container';
import { NEW_EPIC_DIALOG_OPTIONS } from '../../shared/constants';
import { ApiService } from "../api.service";
import { type ModelsEpicShort, type ModelsNewEpicRequest } from '../../types/generated';

@Injectable({
  providedIn: 'root'
})
export class EpicsService {

  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  getEpic(id: number): Observable<Epic> {
    return this.apiService._getEpic(id);
  }

  getEpics(ids: number[]): Observable<Epic[]> {
    return this.apiService._getEpics(ids).pipe(
      map((epics) => epics.filter((epic) => !epic.closed)),
    );
  }

  getAllEpics(): Observable<Epic[]> {
    return this.apiService._getAllEpics().pipe(
      map((epics) => epics.filter((epic) => !epic.closed)),
    );
  }

  updateEpic(epic: Epic): Observable<Epic> {
    return this.apiService._updateEpic(epic)
  }

  closeEpic(id: number): Observable<Epic> {
    return this.apiService._patchEpic(id, { closed: true });
  }

  createNewEpic(obj: ModelsNewEpicRequest): Observable<Epic> {
    return this.apiService._createNewEpic(obj);
  }

  createEpicFromDialog(taskContainer: TaskContainer): Observable<Epic> {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      data: {
        title: 'New epic for ' + taskContainer.getFullDescription(),
        inputWidth: '40rem',
      },
      ...NEW_EPIC_DIALOG_OPTIONS,
    });
    return dialogRef.afterClosed().pipe(
      filter((responseObj: { description?: string; notes?: string } | null) => !!responseObj?.description),
      switchMap((responseObj) => {
        const epic: ModelsEpicShort = {
          description: responseObj!.description!,
          tags: [],
          notes: responseObj!.notes ?? '',
        };
        const parent = { id: taskContainer.id, type: taskContainer.type };
        return this.createNewEpic({ epic, parent });
      }),
    );
  }
}
