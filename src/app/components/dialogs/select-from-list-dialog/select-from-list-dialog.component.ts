import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-select-from-list-dialog',
  standalone: true,
  imports: [],
  templateUrl: './select-from-list-dialog.component.html',
  styleUrl: './select-from-list-dialog.component.scss'
})
export class SelectFromListDialog {

  constructor(
    public dialogRef: MatDialogRef<SelectFromListDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { values: string[] }
  ) { }


  clickOnItem(content: string) {
    this.dialogRef.close(content);
  }
}
