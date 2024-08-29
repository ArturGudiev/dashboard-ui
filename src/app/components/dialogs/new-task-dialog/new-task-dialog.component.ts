import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskC } from '../../../models/task-class';
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { MaterialModule } from "../../../modules/material/material.module";

@Component({
  selector: 'app-new-task-dialog',
  templateUrl: './new-task-dialog.component.html',
  standalone: true,
  imports: [
    CdkTextareaAutosize,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDialogActions,
    MaterialModule,
    MatButton
  ],
  styleUrls: ['./new-task-dialog.component.sass']
})
export class NewTaskDialogComponent implements OnInit {
  static DIALOG_OPTIONS = {
    height: '300px',
    width: '700px',
  }

  myForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    notes: new FormControl('', []),
  });


  constructor(public dialogRef: MatDialogRef<NewTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {parentTask: TaskC}
              ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }
  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }
}
