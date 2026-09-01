import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { Definition } from '../../models/definition';
import { type TaskContainer } from '../../models/interfaces/task-container';
import { GetValueDialogComponent } from '../../components/dialogs/get-value/get-value-dialog.component';
import { GET_VALUE_DIALOG_OPTIONS } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class DefinitionsService {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  getDefinition(id: number): Observable<Definition> {
    return this.apiService._getDefinition(id);
  }

  getDefinitions(ids: number[]): Observable<Definition[]> {
    return this.apiService._getDefinitions(ids);
  }

  updateDefinition(definition: Definition): Observable<Definition> {
    return this.apiService.updateDefinition(definition);
  }

  createDefinitionFromDialog(taskContainer: TaskContainer): Observable<Definition> {
    const nameDialogRef = this.dialog.open(GetValueDialogComponent, {
      data: { title: 'Definition name', inputWidth: '40rem' },
      ...GET_VALUE_DIALOG_OPTIONS,
    });

    return nameDialogRef.afterClosed().pipe(
      filter((name: string) => !!name),
      switchMap((name: string) => {
        const valueDialogRef = this.dialog.open(GetValueDialogComponent, {
          data: { title: 'Definition value', inputWidth: '40rem' },
          ...GET_VALUE_DIALOG_OPTIONS,
        });
        return valueDialogRef.afterClosed().pipe(
          filter((value: string) => value != null),
          switchMap((value: string) => {
            return this.apiService._createNewDefinition({
              definition: {
                name,
                value,
                tags: [],
                notes: '',
              },
              parent: { id: taskContainer.id, type: taskContainer.type },
            });
          }),
        );
      }),
    );
  }
}
