import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormField } from "@angular/material/form-field";
import { NgIf, NgStyle } from "@angular/common";
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
        MaterialModule,
        NgIf
    ],
    styleUrls: ['./get-value-dialog.component.sass']
})
export class GetValueDialogComponent implements OnInit {

  myForm = new FormGroup({
    valueField: new FormControl(null, [
      Validators.required
    ]),
  });
  get getDataInputWidthStyle(): any {
    return this.data.inputWidth && {'width': this.data.inputWidth};
  }


  constructor(public dialogRef: MatDialogRef<GetValueDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {title: string, inputWidth?: number, multiline?: boolean}
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
  }
  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value.valueField);
  }
}
