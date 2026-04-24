import { Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatFormField, MatHint, MatInput, MatLabel } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { NgxMaskDirective } from "ngx-mask";
import { MatButton } from "@angular/material/button";
import moment from "moment";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-get-datetime-dialog',
  imports: [
    FormsModule,
    MatFormField,
    MatHint,
    MatIcon,
    MatInput,
    MatLabel,
    NgxMaskDirective,
    MatButton
  ],
  standalone: true,
  templateUrl: './get-datetime-dialog.component.html',
  styleUrl: './get-datetime-dialog.component.sass',
})
export class GetDatetimeDialogComponent {
  readonly meetingDateTime = signal(moment().format('HH:mm DD:MM:YYYY'));
  private dialogRef = inject(MatDialogRef<GetDatetimeDialogComponent>);

  updateValue(): void {
    this.dialogRef.close({ dateTimeValue: this.meetingDateTime() });
  }

  close(): void {
    this.dialogRef.close();
  }


}
