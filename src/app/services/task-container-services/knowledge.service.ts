import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { Knowledge } from '../../models/knowledge';
import { type TaskContainer } from '../../models/interfaces/task-container';
import {
  AddKnowledgeBitDialogComponent,
  type AddKnowledgeBitDialogResult,
} from '../../components/dialogs/add-knowledge-bit-dialog/add-knowledge-bit-dialog.component';
import { KNOWLEDGE_BIT_DIALOG_OPTIONS } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeService {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  getKnowledgeBits(ids: number[]): Observable<Knowledge[]> {
    return this.apiService._getKnowledgeBits(ids);
  }

  getKnowledge(id: number): Observable<Knowledge> {
    return this.apiService._getKnowledge(id);
  }

  updateKnowledge(knowledge: Knowledge): Observable<Knowledge> {
    return this.apiService._updateKnowledge(knowledge);
  }

  createKnowledgeBitFromDialog(taskContainer: TaskContainer): Observable<Knowledge> {
    const dialogRef = this.dialog.open(AddKnowledgeBitDialogComponent, {
      ...KNOWLEDGE_BIT_DIALOG_OPTIONS,
    });

    return dialogRef.afterClosed().pipe(
      filter((result: AddKnowledgeBitDialogResult | null): result is AddKnowledgeBitDialogResult => !!result),
      switchMap((result) => {
        return this.apiService._createNewKnowledgeBit({
          knowledgeBit: {
            name: result.name,
            value: result.value,
            extension: result.extension,
            tags: [],
            notes: '',
          },
          parent: { id: taskContainer.id, type: taskContainer.type },
        });
      }),
    );
  }
}
