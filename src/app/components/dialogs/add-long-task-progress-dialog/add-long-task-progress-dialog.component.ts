import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { type HandlersAddLongTaskProgressRequest } from '../../../types/generated';

export type AddLongTaskProgressDialogData = {
  longTaskId: number;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-long-task-progress-dialog',
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormField,
  ],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add progress</div>

      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput [formField]="progressForm.name" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Value</mat-label>
        <input matInput [formField]="progressForm.value" type="number">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Total</mat-label>
        <input matInput [formField]="progressForm.total" type="number">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Units</mat-label>
        <input matInput [formField]="progressForm.units" type="text">
      </mat-form-field>

      <button mat-raised-button type="submit" [disabled]="!isFormValid()">
        Add
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
export class AddLongTaskProgressDialogComponent {
  private longTasksService = inject(LongTasksService);
  dialogRef = inject(MatDialogRef<AddLongTaskProgressDialogComponent>);
  dialogData = inject<AddLongTaskProgressDialogData>(MAT_DIALOG_DATA);

  progressModel = signal({
    name: '',
    value: '',
    total: '',
    units: '',
  });

  progressForm = form(this.progressModel, (path) => {
    required(path.name);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.progressModel();
    const body: HandlersAddLongTaskProgressRequest = {
      name: model.name.trim(),
    };

    if (model.value.trim() !== '') {
      body.value = Number(model.value);
    }
    if (model.total.trim() !== '') {
      body.total = Number(model.total);
    }
    if (model.units.trim()) {
      body.units = model.units.trim();
    }

    this.longTasksService.addProgress(this.dialogData.longTaskId, body).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    return this.progressModel().name.trim() !== '';
  }
}
