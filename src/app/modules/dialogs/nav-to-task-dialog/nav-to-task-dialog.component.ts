import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TaskC} from "../../../models/taskClass";

@Component({
  selector: 'app-nav-to-task-dialog',
  templateUrl: './nav-to-task-dialog.component.html',
  styleUrls: ['./nav-to-task-dialog.component.sass']
})
export class NavToTaskDialogComponent implements OnInit {
  myForm = new FormGroup({
    taskId: new FormControl(null, [
      Validators.required
    ]),
  });


  constructor(public dialogRef: MatDialogRef<NavToTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {parentTask: TaskC}
  ) { }

  ngOnInit(): void {
    // console.log('VVVV', this.data.parentTask);
  }

  closeDialog() {
    this.dialogRef.close('Pizza!');
  }
  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value);
  }

}
