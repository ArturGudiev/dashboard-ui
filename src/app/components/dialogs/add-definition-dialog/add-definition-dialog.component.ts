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

export interface AddDefinitionDialogResult {
  name: string;
  value: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-definition-dialog',
  templateUrl: './add-definition-dialog.component.html',
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
  styleUrls: ['./add-definition-dialog.component.sass'],
})
export class AddDefinitionDialogComponent implements AfterViewInit {
  dialogRef = inject(MatDialogRef<AddDefinitionDialogComponent>);
  nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly myForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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

    const { name, value } = this.myForm.getRawValue();
    this.dialogRef.close({
      name: name.trim(),
      value: value.trim(),
    } satisfies AddDefinitionDialogResult);
  }
}
