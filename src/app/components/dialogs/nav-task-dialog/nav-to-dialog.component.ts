import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { TaskC } from "../../../models/task-class";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";

@Component({
    selector: 'app-nav-to-task-dialog',
    templateUrl: './nav-to-dialog.component.html',
    imports: [
        MatLabel,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatDialogActions,
        MatButton,
    ],
    styleUrls: ['./nav-to-dialog.component.sass']
})
export class NavToDialogComponent {
  
  myForm = new FormGroup({
    navItem: new FormControl(null, [Validators.required]),
  });

  dialogRef = inject(MatDialogRef<NavToDialogComponent>);
  data = inject<{ parentTask: TaskC }>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }

}
