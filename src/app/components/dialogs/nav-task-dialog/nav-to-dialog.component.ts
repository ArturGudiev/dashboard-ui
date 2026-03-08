import {Component, Inject, OnInit} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import {TaskC} from "../../../models/task-class";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MaterialModule } from "../../../modules/material/material.module";

@Component({
  selector: 'app-nav-to-task-dialog',
  templateUrl: './nav-to-dialog.component.html',
  standalone: true,
  imports: [
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MaterialModule,
  ],
  styleUrls: ['./nav-to-dialog.component.sass']
})
export class NavToDialogComponent implements OnInit {
  myForm = new FormGroup({
    navItem: new FormControl(null, [
      Validators.required
    ]),
  });


  constructor(public dialogRef: MatDialogRef<NavToDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {parentTask: TaskC}
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
  }
  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }

}
