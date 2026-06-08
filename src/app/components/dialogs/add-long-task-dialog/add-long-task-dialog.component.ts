import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { type ModelsLongTaskShort } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-long-task-dialog',
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
      <div class="text-xl mb-3">Add a new long task</div>

      <mat-form-field>
        <mat-label>Description</mat-label>
        <input matInput [formField]="taskForm.description" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Notes</mat-label>
        <input matInput [formField]="taskForm.notes" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Progress total</mat-label>
        <input matInput [formField]="taskForm.progressTotal" type="number">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Progress done</mat-label>
        <input matInput [formField]="taskForm.progressDone" type="number">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Progress units</mat-label>
        <input matInput [formField]="taskForm.progressUnits" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Tags (comma-separated)</mat-label>
        <input matInput [formField]="taskForm.tags" type="text">
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
export class AddLongTaskDialogComponent {
  private longTasksService = inject(LongTasksService);
  dialogRef = inject(MatDialogRef<AddLongTaskDialogComponent>);

  taskModel = signal({
    description: '',
    notes: '',
    tags: '',
    progressTotal: 100,
    progressDone: 0,
    progressUnits: 'percents',
  });

  taskForm = form(this.taskModel, (path) => {
    required(path.description);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.taskModel();
    const longTask: ModelsLongTaskShort = {
      description: model.description,
      notes: model.notes,
      tags: model.tags ? model.tags.split(',').map((el) => el.trim()).filter(Boolean) : [],
      progressTotal: model.progressTotal,
      progressDone: model.progressDone,
      progressUnits: model.progressUnits,
    };

    this.longTasksService.addNewLongTask(longTask).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    return !!this.taskModel().description;
  }
}
