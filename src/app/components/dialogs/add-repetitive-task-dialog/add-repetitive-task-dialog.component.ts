import { Component, inject, Inject, signal , ChangeDetectionStrategy} from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { form, FormField, min, required } from "@angular/forms/signals";
import { RepetitiveTasksService } from "../../../services/task-container-services/repetitive-tasks.service";
import { ModelsRepetitiveTaskShort } from "../../../types/generated";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-repetitive-task-dialog',
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormField,
  ],
  standalone: true,
  template: `
    <form (submit)="onSubmit($event)" class="pt-4 ps-4">
      <div class="text-xl mb-3">Add a new repetitive task</div>
      <mat-form-field>
        <mat-label>Description</mat-label>
        <input matInput [formField]="taskForm.description" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Notes</mat-label>
        <input matInput [formField]="taskForm.notes" type="text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Once in N Days</mat-label>
        <input matInput [formField]="taskForm.once_in_days" type="number">
      </mat-form-field>

      <button mat-raised-button type="submit" [disabled]="!isFormValid()">
        Отправить
      </button>

    </form>
  `,
  styles: [`
    form
      display: flex
      flex-flow: column
      max-width: 20rem
  `],
})
export class AddRepetitiveTaskDialogComponent {
  private repetitiveTasksService = inject(RepetitiveTasksService);
  dialogRef = inject(MatDialogRef<AddRepetitiveTaskDialogComponent>);
  data = inject<{ title: string, taskContainer: TaskContainer }>(MAT_DIALOG_DATA);
  
  taskModel = signal({
    description: '',
    notes: '',
    tags: '',
    once_in_days: 0,
    once_in_months: 0,
    once_in_weeks: 0,
  });

  // 2. Создание формы с валидацией через схему
  taskForm = form(this.taskModel, (path) => {
    required(path.description);
    min(path.once_in_days, 1);
    min(path.once_in_weeks, 1);
    min(path.once_in_months, 1);
  });

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault();

    const repetitiveTask: ModelsRepetitiveTaskShort = {
      description: this.taskModel().description,
      notes: this.taskModel().notes,
      tags: this.taskModel().tags.split(',').map(el => el.trim()),
      onceInDays: this.taskModel().once_in_days
    };
    this.repetitiveTasksService.addNewRepetitiveTask(repetitiveTask).subscribe(res => {
      this.dialogRef.close();
    });

  }

  isFormValid(): boolean {
    const model = this.taskModel();
    return !!model.description &&
      (model.once_in_days > 0 || model.once_in_weeks > 0 || model.once_in_months > 0);
  }
}
