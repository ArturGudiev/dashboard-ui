import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { type TaskC } from '../../../models/task-class';
import { CommandsService } from '../../../services/commands.service';
import {
  type CreateNewTaskRequest,
  dueDateInputToIso,
  type NewTaskDialogResult,
  tagsFromNewTaskDialog,
  TasksService,
} from '../../../services/task-container-services/tasks.service';

function todayDateInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-due-date-tasks',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './due-date-tasks.component.html',
  styleUrls: ['./due-date-tasks.component.sass'],
})
export class DueDateTasksComponent implements OnInit {
  private tasksService = inject(TasksService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private commandsService = inject(CommandsService);

  readonly dateControl = new FormControl(todayDateInputValue(), { nonNullable: true });
  readonly tasks = signal<TaskC[]>([]);
  readonly displayedColumns = ['description', 'dueDateTime'];

  ngOnInit(): void {
    this.loadTasks(this.dateControl.value);
    this.dateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date) => {
        if (date) {
          this.loadTasks(date);
        }
      });

    this.commandsService
      .getDataStateChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        const command = state.command.trim().split(/\s+/)[0]?.toLowerCase();
        if (
          command === 'gtask' ||
          command === 'gt' ||
          command === 'global-task' ||
          command === 'task'
        ) {
          this.addGlobalTask();
        }
      });
  }

  loadTasks(date: string): void {
    this.tasksService
      .getOpenTasksByDueDate(date)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tasks) => this.tasks.set(tasks));
  }

  addGlobalTask(): void {
    this.tasksService
      .openAddTaskDialog({ initialDueDate: this.dateControl.value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((responseObj: NewTaskDialogResult | undefined) => {
        this.tasksService.addTaskDialogOpened = false;
        if (!responseObj?.description) {
          return;
        }

        const request: CreateNewTaskRequest = {
          task: {
            description: responseObj.description,
            tags: tagsFromNewTaskDialog(responseObj),
            notes: responseObj.notes ?? '',
            ...(responseObj.dueDate
              ? { dueDateTime: dueDateInputToIso(responseObj.dueDate) }
              : {}),
          },
        };

        this.tasksService
          .createNewTask(request)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadTasks(this.dateControl.value));
      });
  }

  onTaskClick(task: TaskC): void {
    this.router.navigate(['task', task.id]);
  }
}
