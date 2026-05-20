import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormField } from "@angular/material/form-field";
import { NgStyle } from "@angular/common";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatButton } from "@angular/material/button";
import { MatDialogActions } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";
import { MatLabel } from "@angular/material/form-field";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-get-value',
    templateUrl: './get-value-dialog.component.html',
    imports: [
      ReactiveFormsModule,
      MatFormField,
      MatLabel,
      MatInput,
      MatButton,
      MatDialogActions,
      NgStyle,
      CdkTextareaAutosize,
    ],
    styleUrls: ['./get-value-dialog.component.sass']
})
export class GetValueDialogComponent {

  myForm = new FormGroup({
    valueField: new FormControl(null, [
      Validators.required
    ]),
  });

  get getDataInputWidthStyle(): any {
    return this.data.inputWidth && {'width': this.data.inputWidth};
  }

  dialogRef = inject(MatDialogRef<GetValueDialogComponent>);
  data = inject<{ title: string, inputWidth?: number, multiline?: boolean }>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value.valueField);
  }
}
