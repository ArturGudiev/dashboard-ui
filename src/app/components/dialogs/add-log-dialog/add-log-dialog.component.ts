import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatButton } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { MatCheckbox } from "@angular/material/checkbox";

@Component({
  selector: 'app-add-log-dialog',
  imports: [
    CdkTextareaAutosize,
    FormsModule,
    MatButton,
    MatDialogActions,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatCheckbox
  ],
  styleUrl: './add-log-dialog.component.sass',
  standalone: true,
  template: `
    <form
      autocomplete="on"
      [formGroup]="myForm"
      (ngSubmit)="onSubmit()"
    >

      <mat-form-field appearance="fill" style="width: 40rem">
        <mat-label>Log</mat-label>
        <textarea
          matInput formControlName="valueField"
          cdkTextareaAutosize
          #autosize="cdkTextareaAutosize"
          cdkAutosizeMinRows="5"
          cdkAutosizeMaxRows="5"
        ></textarea>
      </mat-form-field>

      <mat-checkbox formControlName="isContainerLog">Is Container Log</mat-checkbox>

      <div mat-dialog-actions>
        <button mat-button type="button" (click)="onNoClick()">Cancel</button>
        <button mat-button type="submit" [disabled]="!myForm.valid">Add log</button>
      </div>
    </form>

  `
})
export class AddLogDialogComponent {

  myForm = new FormGroup({
    valueField: new FormControl(null, [Validators.required]),
    isContainerLog: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<AddLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, taskContainer: TaskContainer }
  ) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    let dialogResult = { logMessage: this.myForm.value.valueField, isContainerLog: this.myForm.value.isContainerLog };
    this.dialogRef.close(dialogResult);
  }
}
