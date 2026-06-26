import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { StatesService } from '../../../services/task-container-services/states.service';
import { type ModelsContainerDescription, type ModelsStateShort } from '../../../types/generated';

export type AddStateDialogData = {
  parent: ModelsContainerDescription | null;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-state-dialog',
  imports: [MatButton, MatFormField, MatInput, MatLabel, ReactiveFormsModule, FormField],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add a new state</div>

      <mat-form-field>
        <mat-label>Description</mat-label>
        <input matInput [formField]="stateForm.description" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Notes</mat-label>
        <input matInput [formField]="stateForm.notes" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Tags (comma-separated)</mat-label>
        <input matInput [formField]="stateForm.tags" type="text">
      </mat-form-field>

      <button mat-raised-button type="submit" [disabled]="!isFormValid()">
        Create
      </button>
    </form>
  `,
  styles: [`
    form
      display: flex
      flex-flow: column
      max-width: 20rem
  `],
})
export class AddStateDialogComponent {
  private statesService = inject(StatesService);
  dialogRef = inject(MatDialogRef<AddStateDialogComponent>);
  data = inject<AddStateDialogData>(MAT_DIALOG_DATA);

  stateModel = signal({
    description: '',
    notes: '',
    tags: '',
  });

  stateForm = form(this.stateModel, (path) => {
    required(path.description);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.stateModel();
    const state: ModelsStateShort = {
      description: model.description,
      notes: model.notes,
      tags: model.tags ? model.tags.split(',').map((el) => el.trim()).filter(Boolean) : [],
    };

    this.statesService.addNewState(state, this.data.parent ?? undefined).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    return !!this.stateModel().description;
  }
}
