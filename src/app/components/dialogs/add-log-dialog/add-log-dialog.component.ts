import { Component, Inject, model } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatButton } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { MatOption, MatSelect } from "@angular/material/select";

export interface AddLogDialogResult {
  logMessage: string
  isContainerLog: boolean
  logType: string
}

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
    MatSelect,
    MatOption
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

      <mat-form-field style="width: 10rem">
        <mat-label>Is Container Log</mat-label>
        <mat-select [(value)]="logType" style="width: 10rem">
          <mat-option [value]="'Info'">Info</mat-option>
          <mat-option [value]="'What I did'">What I did</mat-option>
          <mat-option [value]="'What I want'">What I want</mat-option>
          <mat-option [value]="'Current situation'">Current situation</mat-option>
        </mat-select>
      </mat-form-field>

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
  logType = model<'What I did' | 'What I want' | 'Current situation' | 'Info' >('Info')
  constructor(
    public dialogRef: MatDialogRef<AddLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, taskContainer: TaskContainer }
  ) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    let dialogResult: AddLogDialogResult = {
      logMessage: this.myForm.value.valueField ?? '',
      isContainerLog: this.myForm.value.isContainerLog ?? false,
      logType: this.logType()
    };
    this.dialogRef.close(dialogResult);
  }
}
