import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, type Observable, forkJoin, of } from 'rxjs';
import {
  AddDirectionDialogComponent,
} from '../../components/dialogs/add-direction-dialog/add-direction-dialog.component';
import {
  AddDirectionSubmissionDialogComponent,
} from '../../components/dialogs/add-direction-submission-dialog/add-direction-submission-dialog.component';
import { type Direction } from '../../models/direction';
import {
  type EntDirection,
  type EntDirectionSubmission,
  type HandlersAddDirectionSubmissionRequest,
  type HandlersNewDirectionRequest,
  type ModelsContainerDescription,
  type ModelsDirectionShort,
  type ModelsDirectionStatsEntry,
} from '../../types/generated';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class DirectionsService {
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);
  private addDirectionDialogOpened = false;
  private addSubmissionDialogOpened = false;

  getAllDirections(open?: boolean): Observable<EntDirection[]> {
    return this.apiService._getAllDirections(open);
  }

  getDirection(id: number): Observable<Direction> {
    return this.apiService._getDirection(id);
  }

  getDirectionsByIds(ids: number[]): Observable<Direction[]> {
    if (!ids.length) {
      return of([]);
    }
    return forkJoin(ids.map((id) => this.apiService._getDirection(id)));
  }

  getStats(directionId: number): Observable<ModelsDirectionStatsEntry[]> {
    return this.apiService._getDirectionStats(directionId);
  }

  addNewDirection(direction: ModelsDirectionShort, parent?: ModelsContainerDescription): Observable<Direction> {
    const obj: HandlersNewDirectionRequest = { direction, parent };
    return this.apiService._createDirection(obj);
  }

  addSubmission(directionId: number, body: HandlersAddDirectionSubmissionRequest): Observable<EntDirectionSubmission> {
    return this.apiService._addDirectionSubmission(directionId, body);
  }

  openAddDirectionDialog(parent?: ModelsContainerDescription): Observable<void | null> {
    if (this.addDirectionDialogOpened) {
      return EMPTY;
    }
    this.addDirectionDialogOpened = true;
    const dialogRef = this.dialog.open<AddDirectionDialogComponent, ModelsContainerDescription | null, void | null>(
      AddDirectionDialogComponent,
      {
        data: parent ?? null,
        height: '500px',
        width: '600px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addDirectionDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }

  openAddSubmissionDialog(directionId: number): Observable<void | null> {
    if (this.addSubmissionDialogOpened) {
      return EMPTY;
    }
    this.addSubmissionDialogOpened = true;
    const dialogRef = this.dialog.open<AddDirectionSubmissionDialogComponent, number, void | null>(
      AddDirectionSubmissionDialogComponent,
      {
        data: directionId,
        width: '500px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addSubmissionDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }
}
