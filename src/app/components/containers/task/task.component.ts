import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskC } from '../../../models/task-class';
import { getUrlByDescription } from '../../../shared/libs/dashboard.lib';
import { Title } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { TaskContainerComponent } from "../task-container/task-container.component";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@UntilDestroy()
@Component({
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
  get task() {
    return this._task;
  }

  id!: number;
  private _task!: TaskC; // TODO use resolve
  parentsPath = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private tasksService = inject(TasksService);
  private tasksContainerService = inject(TaskContainerService);

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
      this.isLoading.set(true);
      this.id = params['id'];
      this.refreshTaskForTheFirstTime();
    });
  }

  private setTask(val: TaskC, updatePath = true) {
    this._task = val;

    this.titleService.setTitle(this.task.getFullDescription());
    if (this.task !== null && updatePath) {
      this.tasksContainerService.getParentsPath(this.task).subscribe((res: string[]) => {
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
    if (!this.task) {
      return;
    }
    this.tasksService.finishTask(this.task).subscribe(() => {
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
    if (!this.task) {
      return;
    }
    this.tasksService.updateTask(this.task).subscribe((task: TaskC) => this.setTask(task, false));
  }
}
