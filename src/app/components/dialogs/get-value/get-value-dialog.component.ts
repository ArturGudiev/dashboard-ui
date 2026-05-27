import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormField } from "@angular/material/form-field";
import { NgStyle } from "@angular/common";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatButton } from "@angular/material/button";
import { MatDialogActions } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";
import { MatLabel } from "@angular/material/form-field";

export interface GetValueDialogData {
  title: string;
  inputWidth?: string;
  multiline?: boolean;
  initialValue?: string | null;
  selectInitialValue?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-get-value',
    templateUrl: './get-value-dialog.component.html',
    imports: [
      ReactiveFormsModule,
      MatFormField,
      MatLabel,
      MatInput,
      MatButton,
      MatDialogActions,
      NgStyle,
      CdkTextareaAutosize,
    ],
    styleUrls: ['./get-value-dialog.component.sass']
})
export class GetValueDialogComponent implements AfterViewInit {

  dialogRef = inject(MatDialogRef<GetValueDialogComponent>);
  data = inject<GetValueDialogData>(MAT_DIALOG_DATA);
  valueInput = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('valueInput');

  myForm = new FormGroup({
    valueField: new FormControl(this.data.initialValue ?? '', [
      Validators.required,
    ]),
  });

  get getDataInputWidthStyle(): Record<string, string> | null {
    return this.data.inputWidth ? { width: this.data.inputWidth } : null;
  }

  ngAfterViewInit(): void {
    if (!this.data.selectInitialValue) {
      return;
    }
    setTimeout(() => {
      const el = this.valueInput()?.nativeElement;
      if (!el) {
        return;
      }
      el.focus();
      el.select();
    });
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.myForm.value.valueField);
  }
}
