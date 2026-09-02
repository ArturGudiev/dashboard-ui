import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

export interface AddKnowledgeBitDialogResult {
  name: string;
  value: string;
  extension: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-knowledge-bit-dialog',
  templateUrl: './add-knowledge-bit-dialog.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatDialogActions,
    CdkTextareaAutosize,
  ],
  standalone: true,
  styleUrls: ['./add-knowledge-bit-dialog.component.sass'],
})
export class AddKnowledgeBitDialogComponent implements AfterViewInit {
  dialogRef = inject(MatDialogRef<AddKnowledgeBitDialogComponent>);
  nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly myForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    extension: new FormControl('', { nonNullable: true }),
    value: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngAfterViewInit(): void {
    setTimeout(() => this.nameInput()?.nativeElement.focus());
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.myForm.invalid) {
      return;
    }

    const { name, value, extension } = this.myForm.getRawValue();
    this.dialogRef.close({
      name: name.trim(),
      value: value.trim(),
      extension: extension.trim(),
    } satisfies AddKnowledgeBitDialogResult);
  }
}
