import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

export interface VariableDialogData {
  variableName?: string;
  variableValue?: string;
  inputWidth?: string;
}

export interface VariableDialogResult {
  variableName: string;
  variableValue: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-variable-dialog',
  templateUrl: './variable-dialog.component.html',
  imports: [
    ReactiveFormsModule,
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatDialogActions,
  ],
  standalone: true,
  styleUrls: ['./variable-dialog.component.sass'],
})
export class VariableDialogComponent {
  dialogRef = inject(MatDialogRef<VariableDialogComponent>);
  data = inject<VariableDialogData>(MAT_DIALOG_DATA);

  variableModel = signal({
    variableName: this.data.variableName ?? '',
    variableValue: this.data.variableValue ?? '',
  });

  variableForm = form(this.variableModel, (path) => {
    required(path.variableName);
  });

  readonly title = computed(() =>
    this.data.variableName !== undefined || this.data.variableValue !== undefined
      ? 'Edit variable'
      : 'Add variable',
  );

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    const model = this.variableModel();
    this.dialogRef.close({
      variableName: model.variableName,
      variableValue: model.variableValue,
    } satisfies VariableDialogResult);
  }

  isFormValid(): boolean {
    return !!this.variableModel().variableName.trim();
  }
}
