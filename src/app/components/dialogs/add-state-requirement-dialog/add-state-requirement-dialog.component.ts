import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { StatesService } from '../../../services/task-container-services/states.service';
import { type ModelsStateRequirementShort } from '../../../types/generated';

export type AddStateRequirementDialogData = {
  stateId: number;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-state-requirement-dialog',
  imports: [MatButton, MatFormField, MatInput, MatLabel, ReactiveFormsModule, FormField],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add a state requirement</div>

      <mat-form-field>
        <mat-label>Description</mat-label>
        <input matInput [formField]="requirementForm.description" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Once in days (optional)</mat-label>
        <input matInput [formField]="requirementForm.onceInDays" type="number">
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
export class AddStateRequirementDialogComponent {
  private statesService = inject(StatesService);
  dialogRef = inject(MatDialogRef<AddStateRequirementDialogComponent>);
  data = inject<AddStateRequirementDialogData>(MAT_DIALOG_DATA);

  requirementModel = signal({
    description: '',
    onceInDays: '',
  });

  requirementForm = form(this.requirementModel, (path) => {
    required(path.description);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.requirementModel();
    const requirement: ModelsStateRequirementShort = {
      description: model.description,
    };
    if (model.onceInDays.trim() !== '') {
      requirement.onceInDays = Number(model.onceInDays);
    }

    this.statesService.addStateRequirement(this.data.stateId, requirement).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    return !!this.requirementModel().description;
  }
}
