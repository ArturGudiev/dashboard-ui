import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { StatesService } from '../../../services/task-container-services/states.service';

export type AddStateRequirementCheckDialogData = {
  requirementId: number;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-state-requirement-check-dialog',
  imports: [MatButton, MatRadioGroup, MatRadioButton],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add a check</div>

      <mat-radio-group [value]="isFulfilled()" (change)="isFulfilled.set($event.value)">
        <mat-radio-button [value]="true">Fulfilled</mat-radio-button>
        <mat-radio-button [value]="false">Not fulfilled</mat-radio-button>
      </mat-radio-group>

      <button mat-raised-button type="submit" class="mt-3">
        Create
      </button>
    </form>
  `,
  styles: [`
    form
      display: flex
      flex-flow: column
      max-width: 20rem

    mat-radio-button
      display: block
      margin-bottom: 0.5rem
  `],
})
export class AddStateRequirementCheckDialogComponent {
  private statesService = inject(StatesService);
  dialogRef = inject(MatDialogRef<AddStateRequirementCheckDialogComponent>);
  data = inject<AddStateRequirementCheckDialogData>(MAT_DIALOG_DATA);

  isFulfilled = signal(true);

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    this.statesService
      .addStateRequirementCheck(this.data.requirementId, this.isFulfilled())
      .subscribe(() => {
        this.dialogRef.close();
      });
  }
}
