import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { hasNumericProgressForProgress } from '../../../shared/libs/long-task.lib';
import {
  type HandlersAddLongTaskProgressSubmissionRequest,
  type ModelsLongTaskProgress,
} from '../../../types/generated';

export type AddLongTaskProgressSubmissionDialogData = {
  progress: ModelsLongTaskProgress;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-long-task-progress-submission-dialog',
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
      <div class="text-xl mb-3">Add submission for {{ dialogData.progress.name }}</div>

      @if (useNumericProgress()) {
        <mat-form-field>
          <mat-label>Progress to add</mat-label>
          <input matInput [formField]="submissionForm.progressToAdd" type="number">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Progress to set</mat-label>
          <input matInput [formField]="submissionForm.progressToSet" type="number">
        </mat-form-field>
      } @else {
        <mat-form-field>
          <mat-label>Progress raw</mat-label>
          <input matInput [formField]="submissionForm.progressRaw" type="text">
        </mat-form-field>
      }

      <mat-form-field>
        <mat-label>Execution date</mat-label>
        <input matInput [formField]="submissionForm.executionDate" type="datetime-local">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Comments</mat-label>
        <input matInput [formField]="submissionForm.comments" type="text">
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
export class AddLongTaskProgressSubmissionDialogComponent {
  private longTasksService = inject(LongTasksService);
  dialogRef = inject(MatDialogRef<AddLongTaskProgressSubmissionDialogComponent>);
  dialogData = inject<AddLongTaskProgressSubmissionDialogData>(MAT_DIALOG_DATA);

  readonly useNumericProgress = computed(() => hasNumericProgressForProgress(this.dialogData.progress));

  submissionModel = signal({
    progressToAdd: '',
    progressToSet: '',
    progressRaw: '',
    executionDate: '',
    comments: '',
  });

  submissionForm = form(this.submissionModel);

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.submissionModel();
    const body: HandlersAddLongTaskProgressSubmissionRequest = {};

    if (this.useNumericProgress()) {
      if (model.progressToAdd.trim() !== '') {
        body.progressToAdd = Number(model.progressToAdd);
      }
      if (model.progressToSet.trim() !== '') {
        body.progressToSet = Number(model.progressToSet);
      }
    } else if (model.progressRaw.trim()) {
      body.progressRaw = model.progressRaw.trim();
    }

    if (model.executionDate.trim()) {
      body.executionDate = new Date(model.executionDate).toISOString();
    }

    if (model.comments.trim()) {
      body.comments = model.comments.trim();
    }

    this.longTasksService
      .addProgressSubmission(this.dialogData.progress.id, body)
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  isFormValid(): boolean {
    const model = this.submissionModel();
    if (this.useNumericProgress()) {
      return model.progressToAdd.trim() !== '' || model.progressToSet.trim() !== '';
    }
    return model.progressRaw.trim() !== '';
  }
}
