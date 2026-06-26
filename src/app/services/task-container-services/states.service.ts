import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, forkJoin, type Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  AddStateDialogComponent,
  type AddStateDialogData,
} from '../../components/dialogs/add-state-dialog/add-state-dialog.component';
import {
  AddStateRequirementDialogComponent,
  type AddStateRequirementDialogData,
} from '../../components/dialogs/add-state-requirement-dialog/add-state-requirement-dialog.component';
import {
  AddStateRequirementCheckDialogComponent,
  type AddStateRequirementCheckDialogData,
} from '../../components/dialogs/add-state-requirement-check-dialog/add-state-requirement-check-dialog.component';
import {
  type ModelsContainerDescription,
  type ModelsNewStateRequest,
  type ModelsStateFull,
  type ModelsStateRequirementCheckShort,
  type ModelsStateRequirementShort,
  type ModelsStateShort,
  type EntStateRequirementCheck,
} from '../../types/generated';
import {
  type ModelsStateDetail,
  type ModelsStateRequirementDetail,
} from '../../shared/libs/state.lib';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class StatesService {
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);
  private addStateDialogOpened = false;
  private addStateRequirementDialogOpened = false;
  private addStateRequirementCheckDialogOpened = false;

  getAllStates(): Observable<ModelsStateFull[]> {
    return this.apiService._getAllStates();
  }

  getState(id: number): Observable<ModelsStateDetail> {
    return forkJoin({
      state: this.apiService._getState(id),
      requirements: this.apiService._getStateRequirements(id),
    }).pipe(
      switchMap(({ state, requirements }) => {
        const childIds = state.states ?? [];
        if (!childIds.length) {
          return of({ ...state, requirements, childStates: [] });
        }
        return forkJoin(childIds.map((childId) => this.apiService._getState(childId))).pipe(
          map((childStates) => ({ ...state, requirements, childStates })),
        );
      }),
    );
  }

  addNewState(state: ModelsStateShort, parent?: ModelsContainerDescription): Observable<ModelsStateFull> {
    const body: ModelsNewStateRequest = { state, parent };
    return this.apiService._createState(body);
  }

  addStateRequirement(stateId: number, requirement: ModelsStateRequirementShort): Observable<void> {
    return this.apiService._addStateRequirement(stateId, requirement).pipe(map(() => undefined));
  }

  getStateRequirement(id: number): Observable<ModelsStateRequirementDetail> {
    return forkJoin({
      requirements: this.apiService._getStateRequirementsByIds([id]),
      checks: this.apiService._getStateRequirementChecks(id),
    }).pipe(
      map(({ requirements, checks }) => {
        const requirement = requirements[0];
        if (!requirement) {
          throw new Error(`State requirement ${id} not found`);
        }
        return { ...requirement, checks };
      }),
    );
  }

  addStateRequirementCheck(requirementId: number, isFulfilled: boolean): Observable<EntStateRequirementCheck> {
    const body: ModelsStateRequirementCheckShort = { isFulfilled };
    return this.apiService._addStateRequirementCheck(requirementId, body);
  }

  openAddStateDialog(parent?: ModelsContainerDescription): Observable<void | null> {
    if (this.addStateDialogOpened) {
      return EMPTY;
    }
    this.addStateDialogOpened = true;
    const dialogData: AddStateDialogData = { parent: parent ?? null };
    const dialogRef = this.dialog.open<AddStateDialogComponent, AddStateDialogData, void | null>(
      AddStateDialogComponent,
      {
        data: dialogData,
        width: '500px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addStateDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }

  openAddStateRequirementDialog(stateId: number): Observable<void | null> {
    if (this.addStateRequirementDialogOpened) {
      return EMPTY;
    }
    this.addStateRequirementDialogOpened = true;
    const dialogData: AddStateRequirementDialogData = { stateId };
    const dialogRef = this.dialog.open<
      AddStateRequirementDialogComponent,
      AddStateRequirementDialogData,
      void | null
    >(
      AddStateRequirementDialogComponent,
      {
        data: dialogData,
        width: '500px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addStateRequirementDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }

  openAddStateRequirementCheckDialog(requirementId: number): Observable<void | null> {
    if (this.addStateRequirementCheckDialogOpened) {
      return EMPTY;
    }
    this.addStateRequirementCheckDialogOpened = true;
    const dialogData: AddStateRequirementCheckDialogData = { requirementId };
    const dialogRef = this.dialog.open<
      AddStateRequirementCheckDialogComponent,
      AddStateRequirementCheckDialogData,
      void | null
    >(
      AddStateRequirementCheckDialogComponent,
      {
        data: dialogData,
        width: '400px',
      },
    );
    dialogRef.afterClosed().subscribe(() => {
      this.addStateRequirementCheckDialogOpened = false;
    });
    return dialogRef.afterClosed();
  }
}
