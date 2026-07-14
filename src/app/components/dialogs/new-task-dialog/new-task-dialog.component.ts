import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { MatLabel } from "@angular/material/form-field";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { type NewTaskDialogResult } from '../../../services/task-container-services/tasks.service';

export type NewTaskDialogData = {
  title?: string;
  inputWidth?: string;
  markSelectedByDefault?: boolean;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-new-task-dialog',
    templateUrl: './new-task-dialog.component.html',
    imports: [
        CdkTextareaAutosize,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatDialogActions,
        MatButton,
        MatCheckboxModule,
    ],
    styleUrls: ['./new-task-dialog.component.sass']
})
export class NewTaskDialogComponent {
  static DIALOG_OPTIONS = { height: '300px', width: '700px' };

  dialogRef = inject(MatDialogRef<NewTaskDialogComponent>);
  data = inject<NewTaskDialogData>(MAT_DIALOG_DATA, { optional: true });

  myForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    notes: new FormControl('', []),
    markSelected: new FormControl(this.data?.markSelectedByDefault ?? false, []),
  });

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    const value = this.myForm.value;
    const result: NewTaskDialogResult = {
      description: value.description ?? '',
      notes: value.notes ?? '',
      markSelected: !!value.markSelected,
    };
    this.dialogRef.close(result);
  }
}
