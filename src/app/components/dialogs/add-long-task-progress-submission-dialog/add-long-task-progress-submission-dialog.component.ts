import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { MessageService } from '../../../services/message.service';
import { hasNumericProgressForProgress } from '../../../shared/libs/long-task.lib';
import {
  type HandlersAddLongTaskProgressSubmissionRequest,
  type ModelsLongTaskProgress,
} from '../../../types/generated';

export type AddLongTaskProgressSubmissionDialogData = {
  progress: ModelsLongTaskProgress;
};

/** `datetime-local` inputs require local `YYYY-MM-DDTHH:mm`, not ISO UTC strings. */
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fieldToString(value: string | number | null | undefined): string {
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

function hasProgressId(progress: ModelsLongTaskProgress): progress is ModelsLongTaskProgress & { id: number } {
  return progress.id != null && progress.id > 0;
}

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

      @if (!canSubmitForProgress()) {
        <p class="submit-error">
          Add a progress record first (legacy task progress cannot receive submissions).
        </p>
      }

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

      <button mat-raised-button type="submit" [disabled]="!isFormValid() || !canSubmitForProgress()">
        Add
      </button>
    </form>
  `,
  styles: [`
    form
      display: flex
      flex-flow: column
      max-width: 20rem

    .submit-error
      color: #b71c1c
      margin: 0 0 1rem
  `],
})
export class AddLongTaskProgressSubmissionDialogComponent {
  private longTasksService = inject(LongTasksService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddLongTaskProgressSubmissionDialogComponent>);
  dialogData = inject<AddLongTaskProgressSubmissionDialogData>(MAT_DIALOG_DATA);

  readonly useNumericProgress = computed(() => hasNumericProgressForProgress(this.dialogData.progress));
  readonly canSubmitForProgress = computed(() => hasProgressId(this.dialogData.progress));

  submissionModel = signal({
    progressToAdd: '',
    progressToSet: '',
    progressRaw: '',
    executionDate: toDatetimeLocalValue(new Date()),
    comments: '',
  });

  submissionForm = form(this.submissionModel);

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.canSubmitForProgress()) {
      this.messageService.showMessage('Add a progress record before submitting.');
      return;
    }

    const model = this.submissionModel();
    const body: HandlersAddLongTaskProgressSubmissionRequest = {};

    if (this.useNumericProgress()) {
      const progressToAdd = fieldToString(model.progressToAdd);
      const progressToSet = fieldToString(model.progressToSet);
      if (progressToAdd !== '') {
        body.progressToAdd = Number(progressToAdd);
      }
      if (progressToSet !== '') {
        body.progressToSet = Number(progressToSet);
      }
    } else {
      const progressRaw = fieldToString(model.progressRaw);
      if (progressRaw) {
        body.progressRaw = progressRaw;
      }
    }

    const executionDate = fieldToString(model.executionDate);
    if (executionDate) {
      body.executionDate = new Date(executionDate).toISOString();
    }

    const comments = fieldToString(model.comments);
    if (comments) {
      body.comments = comments;
    }

    this.longTasksService
      .addProgressSubmission(this.dialogData.progress.id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.dialogRef.close(),
        error: () => this.messageService.showMessage('Failed to add submission.'),
      });
  }

  isFormValid(): boolean {
    const model = this.submissionModel();
    if (this.useNumericProgress()) {
      return fieldToString(model.progressToAdd) !== '' || fieldToString(model.progressToSet) !== '';
    }
    return fieldToString(model.progressRaw) !== '';
  }
}
