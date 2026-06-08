import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { type HandlersAddLongTaskSubmissionRequest } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-long-task-submission-dialog',
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
      <div class="text-xl mb-3">Add submission</div>

      <mat-form-field>
        <mat-label>Progress to add</mat-label>
        <input matInput [formField]="submissionForm.progressToAdd" type="number">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Progress to set</mat-label>
        <input matInput [formField]="submissionForm.progressToSet" type="number">
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
export class AddLongTaskSubmissionDialogComponent {
  private longTasksService = inject(LongTasksService);
  dialogRef = inject(MatDialogRef<AddLongTaskSubmissionDialogComponent>);
  longTaskId = inject<number>(MAT_DIALOG_DATA);

  submissionModel = signal({
    progressToAdd: '',
    progressToSet: '',
    comments: '',
  });

  submissionForm = form(this.submissionModel);

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.submissionModel();
    const body: HandlersAddLongTaskSubmissionRequest = {};

    if (model.progressToAdd.trim() !== '') {
      body.progressToAdd = Number(model.progressToAdd);
    }
    if (model.progressToSet.trim() !== '') {
      body.progressToSet = Number(model.progressToSet);
    }
    if (model.comments.trim()) {
      body.comments = model.comments.trim();
    }

    this.longTasksService.addSubmission(this.longTaskId, body).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    const model = this.submissionModel();
    return model.progressToAdd.trim() !== '' || model.progressToSet.trim() !== '';
  }
}
