import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormField } from "@angular/material/form-field";
import { NgStyle } from "@angular/common";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MaterialModule } from "../../../modules/material/material.module";

@Component({
    selector: 'app-get-value',
    templateUrl: './get-value-dialog.component.html',
    imports: [
      ReactiveFormsModule,
      MatFormField,
      NgStyle,
      CdkTextareaAutosize,
      MaterialModule
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
