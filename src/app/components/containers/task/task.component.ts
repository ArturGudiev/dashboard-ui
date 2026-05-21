import { Component, DestroyRef, effect, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { TaskC } from '../../../models/task-class';
import { TasksService } from '../../../services/task-container-services/tasks.service';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./task.component.sass'],
})
export class TaskComponent {
  /** From route param `id` (withComponentInputBinding). */
  id = input.required<number>();

  /** From route resolve `task` — refreshed when `id` changes (`runGuardsAndResolvers: 'paramsChange'`). */
  task = input.required<TaskC>();

  /** Resolver value, or last `reloadTask()` result (e.g. after adding a subtask). */
  readonly taskForView = linkedSignal(() => this.task());

  private tasksService = inject(TasksService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.titleService.setTitle(this.taskForView().getFullDescription());
    });
  }

  reloadTask(): void {
    this.tasksService
      .getTask(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((t) => this.taskForView.set(t));
  }

  updateTask(): void {
    this.tasksService
      .updateTask(this.taskForView())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.taskForView.set(updated));
  }
}
