import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectionsService } from '../../../services/task-container-services/directions.service';
import { type HandlersAddDirectionSubmissionRequest } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-direction-submission-dialog',
  imports: [MatButton, MatFormField, MatInput, MatLabel, ReactiveFormsModule, FormField],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add submission</div>

      <mat-form-field>
        <mat-label>Text</mat-label>
        <textarea matInput [formField]="submissionForm.text" rows="4"></textarea>
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
      max-width: 24rem
  `],
})
export class AddDirectionSubmissionDialogComponent {
  private directionsService = inject(DirectionsService);
  dialogRef = inject(MatDialogRef<AddDirectionSubmissionDialogComponent>);
  directionId = inject<number>(MAT_DIALOG_DATA);

  submissionModel = signal({ text: '' });
  submissionForm = form(this.submissionModel, (path) => {
    required(path.text);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const text = this.submissionModel().text.trim();
    const body: HandlersAddDirectionSubmissionRequest = { text };

    this.directionsService.addSubmission(this.directionId, body).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    return this.submissionModel().text.trim() !== '';
  }
}
