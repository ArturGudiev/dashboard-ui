import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-get-value',
  templateUrl: './get-value-dialog.component.html',
  styleUrls: ['./get-value-dialog.component.sass']
})
export class GetValueDialogComponent implements OnInit {

  myForm = new FormGroup({
    valueField: new FormControl(null, [
      Validators.required
    ]),
  });


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
