import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

export interface UnlockFilesDialogResult {
  password: string;
  salt: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-unlock-files-dialog',
  standalone: true,
  templateUrl: './unlock-files-dialog.component.html',
  styleUrls: ['./unlock-files-dialog.component.sass'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
})
export class UnlockFilesDialogComponent {
  private dialogRef = inject(MatDialogRef<UnlockFilesDialogComponent, UnlockFilesDialogResult | null>);

  readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    salt: new FormControl('', { nonNullable: true }),
  });

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (!this.form.valid) {
      return;
    }
    this.dialogRef.close({
      password: this.form.controls.password.value.trim(),
      salt: this.form.controls.salt.value.trim(),
    });
  }
}
