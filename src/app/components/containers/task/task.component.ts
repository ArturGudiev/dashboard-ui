import { Component, DestroyRef, inject, OnDestroy, OnInit, signal , ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskC } from '../../../models/task-class';
import { getUrlByDescription } from '../../../shared/libs/dashboard.lib';
import { Title } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { TaskContainerComponent } from "../task-container/task-container.component";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-task',
  templateUrl: './task.component.html',
  imports: [
    MatProgressSpinner,
    TaskContainerComponent,
  ],
  standalone: true,
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit, OnDestroy {
  readonly task = signal<TaskC | null>(null);

  id!: number;
  parentsPath = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private tasksService = inject(TasksService);
  private tasksContainerService = inject(TaskContainerService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.isLoading.set(true);
      this.id = params['id'];
      this.refreshTaskForTheFirstTime();
    });
  }

  private setTask(val: TaskC, updatePath = true) {
    this.task.set(val);

    this.titleService.setTitle(val.getFullDescription());
    if (updatePath) {
      this.tasksContainerService.getParentsPath(val).subscribe((res: string[]) => {
        this.parentsPath.set(res);
      });
    }
  }

  private refreshTaskForTheFirstTime() {
    const state = this.router.currentNavigation()?.extras.state;
    if (state) {
      // History restores state as a plain object — rehydrate so TaskContainer methods exist.
      this.setTask(TaskC.createFromObj(state));
      this.isLoading.set(false);
      return;
    }
    this.refreshTask();
  }

  refreshTask(): void {
    this.isLoading.set(true);
    this.tasksService.getTask(this.id).subscribe(task => {
      this.setTask(task);
      this.isLoading.set(false);
    })
  }

  refreshSubtasks$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.questions));

  ngOnDestroy(): void {
    this.isLoading.set(true);
  }

  onDoneAllClick() {
    const currentTask = this.task();
    if (!currentTask) {
      return;
    }
    this.tasksService.finishTask(currentTask).subscribe(() => {
      if (this.parentsPath() && this.parentsPath().length > 1) {
        const description = this.parentsPath().slice(-2, -1)[0];
        this.goToParentHandler(description);
      }
    });
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  /**
   * Сохранение задачи (например, для обновления в базе заметок)
   */
  updateTask() {
    const currentTask = this.task();
    if (!currentTask) {
      return;
    }
    this.tasksService.updateTask(currentTask).subscribe((task: TaskC) => this.setTask(task, false));
  }
}
