import { Component, DestroyRef, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton, MatMiniFabButton } from "@angular/material/button";
import { MatLabel } from "@angular/material/form-field";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { type NewTaskDialogResult } from '../../../services/task-container-services/tasks.service';
import { AppStore } from '../../../state/app.store';

export type NewTaskDialogData = {
  title?: string;
  inputWidth?: string;
  markSelectedByDefault?: boolean;
  afterTaskByDefault?: boolean;
  /** YYYY-MM-DD — shows the due-date field prefilled when set */
  initialDueDate?: string;
};

function todayDateInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-new-task-dialog',
    templateUrl: './new-task-dialog.component.html',
    imports: [
        CdkTextareaAutosize,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatDialogActions,
        MatButton,
        MatMiniFabButton,
        MatCheckboxModule,
        MatIconModule,
    ],
    styleUrls: ['./new-task-dialog.component.sass']
})
export class NewTaskDialogComponent {
  static DIALOG_OPTIONS = { height: '300px', width: '700px' };

  dialogRef = inject(MatDialogRef<NewTaskDialogComponent>);
  data = inject<NewTaskDialogData>(MAT_DIALOG_DATA, { optional: true });
  private destroyRef = inject(DestroyRef);
  private appStore = inject(AppStore);

  readonly showDueDate = signal(!!this.data?.initialDueDate);

  myForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    notes: new FormControl('', []),
    dueDate: new FormControl(this.data?.initialDueDate ?? '', []),
    markSelected: new FormControl(this.data?.markSelectedByDefault ?? false, []),
    afterTask: new FormControl(this.data?.afterTaskByDefault ?? false, []),
  });

  constructor() {
    this.appStore.setDisabledHotkeys(true);
    this.destroyRef.onDestroy(() => this.appStore.setDisabledHotkeys(false));
  }

  showDueDateField(): void {
    this.myForm.controls.dueDate.setValue(todayDateInputValue());
    this.showDueDate.set(true);
  }

  clearDueDateField(): void {
    this.myForm.controls.dueDate.setValue('');
    this.showDueDate.set(false);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    const value = this.myForm.value;
    const dueDate = this.showDueDate() ? (value.dueDate ?? '').trim() : '';
    const result: NewTaskDialogResult = {
      description: value.description ?? '',
      notes: value.notes ?? '',
      markSelected: !!value.markSelected,
      afterTask: !!value.afterTask,
      dueDate: dueDate || undefined,
    };
    this.dialogRef.close(result);
  }
}
