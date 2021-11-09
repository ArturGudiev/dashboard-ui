import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-definition',
  templateUrl: './definition-dialog.component.html',
  styleUrls: ['./definition-dialog.component.sass']
})
export class DefinitionDialogComponent implements OnInit {

  myForm = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    value: new FormControl(null, [Validators.required]),
  });


  constructor(public dialogRef: MatDialogRef<DefinitionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {title: string}
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
