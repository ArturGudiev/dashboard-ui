import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { TaskC } from "../../../models/task-class";
import { MatFormField } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { MaterialModule } from "../../../modules/material/material.module";

@Component({
    selector: 'app-command-dialog',
    templateUrl: './command-dialog.component.html',
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
export class CommandDialogComponent {
  myForm = new FormGroup({
    command: new FormControl(null, [
      Validators.required
    ]),
  });

  dialogRef = inject(MatDialogRef<CommandDialogComponent>);
  data = inject<{ parentTask: TaskC }>(MAT_DIALOG_DATA); 


  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }

}
