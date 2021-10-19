import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TaskC} from "../../../models/task-class";

@Component({
  selector: 'app-nav-to-task-dialog',
  templateUrl: './nav-to-dialog.component.html',
  styleUrls: ['./nav-to-task-dialog.component.sass']
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
