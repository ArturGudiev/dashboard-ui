import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectionsService } from '../../../services/task-container-services/directions.service';
import { type ModelsContainerDescription, type ModelsDirectionShort } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-direction-dialog',
  imports: [MatButton, MatFormField, MatInput, MatLabel, ReactiveFormsModule, FormField],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add a new direction</div>

      <mat-form-field>
        <mat-label>Description</mat-label>
        <input matInput [formField]="directionForm.description" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Notes</mat-label>
        <input matInput [formField]="directionForm.notes" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Tags (comma-separated)</mat-label>
        <input matInput [formField]="directionForm.tags" type="text">
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
export class AddDirectionDialogComponent {
  private directionsService = inject(DirectionsService);
  dialogRef = inject(MatDialogRef<AddDirectionDialogComponent>);
  parent = inject<ModelsContainerDescription | null>(MAT_DIALOG_DATA, { optional: true });

  directionModel = signal({
    description: '',
    notes: '',
    tags: '',
  });

  directionForm = form(this.directionModel, (path) => {
    required(path.description);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.directionModel();
    const direction: ModelsDirectionShort = {
      description: model.description,
      notes: model.notes,
      tags: model.tags ? model.tags.split(',').map((el) => el.trim()).filter(Boolean) : [],
    };

    this.directionsService.addNewDirection(direction, this.parent ?? undefined).subscribe(() => {
      this.dialogRef.close();
    });
  }

  isFormValid(): boolean {
    return !!this.directionModel().description;
  }
}
