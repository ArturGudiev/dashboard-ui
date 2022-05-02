import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TaskC} from '../../../models/task-class';
@Component({
  selector: 'app-new-task-dialog',
  templateUrl: './new-task-dialog.component.html',
  styleUrls: ['./new-task-dialog.component.sass']
})
export class NewTaskDialogComponent implements OnInit {
  static DIALOG_OPTIONS = {
    height: '300px',
    width: '700px',
  }

  myForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    notes: new FormControl('', []),
  });


  constructor(public dialogRef: MatDialogRef<NewTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {parentTask: TaskC}
              ) { }

  ngOnInit(): void {
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
