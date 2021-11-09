import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Task} from "../../../models/task-class";

@Component({
  selector: 'app-command-dialog',
  templateUrl: './command-dialog.component.html',
  styleUrls: ['./command-dialog.component.sass']
})
export class CommandDialogComponent implements OnInit {
  myForm = new FormGroup({
    command: new FormControl(null, [
      Validators.required
    ]),
  });


  constructor(public dialogRef: MatDialogRef<CommandDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {parentTask: Task}
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
