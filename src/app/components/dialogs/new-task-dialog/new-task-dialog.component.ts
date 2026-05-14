import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskC } from '../../../models/task-class';
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { MatLabel } from "@angular/material/form-field";

@Component({
    selector: 'app-new-task-dialog',
    templateUrl: './new-task-dialog.component.html',
    imports: [
        CdkTextareaAutosize,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatDialogActions,
        MatButton
    ],
    styleUrls: ['./new-task-dialog.component.sass']
})
export class NewTaskDialogComponent {
  static DIALOG_OPTIONS = { height: '300px', width: '700px' };

  myForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    notes: new FormControl('', []),
  });

  dialogRef = inject(MatDialogRef<NewTaskDialogComponent>);
  data = inject<{ parentTask: TaskC }>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }
}
