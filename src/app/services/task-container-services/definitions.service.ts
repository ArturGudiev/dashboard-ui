import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { Definition } from '../../models/definition';
import { type TaskContainer } from '../../models/interfaces/task-container';
import {
  AddDefinitionDialogComponent,
  type AddDefinitionDialogResult,
} from '../../components/dialogs/add-definition-dialog/add-definition-dialog.component';
import { DEFINITION_DIALOG_OPTIONS } from '../../shared/constants';

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
    const dialogRef = this.dialog.open(AddDefinitionDialogComponent, {
      ...DEFINITION_DIALOG_OPTIONS,
    });

    return dialogRef.afterClosed().pipe(
      filter((result: AddDefinitionDialogResult | null): result is AddDefinitionDialogResult => !!result),
      switchMap((result) => {
        return this.apiService._createNewDefinition({
          definition: {
            name: result.name,
            value: result.value,
            tags: [],
            notes: '',
          },
          parent: { id: taskContainer.id, type: taskContainer.type },
        });
      }),
    );
  }
}
