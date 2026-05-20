import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { TaskC } from "../../../models/task-class";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-command-dialog',
    templateUrl: './command-dialog.component.html',
    imports: [
        MatFormField,
        MatLabel,
        ReactiveFormsModule,
        MatDialogActions,
        MatButton,
        MatInput,
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
