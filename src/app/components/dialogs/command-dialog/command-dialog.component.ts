import {Component, Inject, OnInit} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import {TaskC} from "../../../models/task-class";
import { MatFormField } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { MaterialModule } from "../../../modules/material/material.module";

@Component({
  selector: 'app-command-dialog',
  templateUrl: './command-dialog.component.html',
  standalone: true,
  imports: [
    MatFormField,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MatInput,
    MaterialModule, // because of label
  ],
  styleUrls: ['./command-dialog.component.sass']
})
export class CommandDialogComponent implements OnInit {
  myForm = new FormGroup({
    command: new FormControl(null, [
      Validators.required
    ]),
  });

  constructor(
    public dialogRef: MatDialogRef<CommandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {parentTask: TaskC}
  ) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }

}
