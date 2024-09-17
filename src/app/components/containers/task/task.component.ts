import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskC } from '../../../models/task-class';
import { getUrlByDescription } from '../../../shared/libs/dashboard.lib';
import { Title } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { CommonModule } from "@angular/common";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { LongClickDirectiveDirective } from "../../../directives/long-click-directive.directive";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { TreeNode } from "../tree/my-tree.component";

const TREE_DATA: TreeNode[] = [
  {
    name: 'Parent 1',
    depth: 0,

    children: [
      { name: 'Child 1.1', depth: 1, },
      {
        name: 'Child 1.2',
        depth: 1,
        children: [
          { name: 'Grandchild 1.2.1', depth: 2, },
          { name: 'Grandchild 1.2.2', depth: 2, },
        ]
      },
    ]
  },
  {
    name: 'Parent 2',
    depth: 0,
    children: [
      { name: 'Child 2.1', depth: 1, },
      { name: 'Child 2.2', depth: 1, },
    ]
  }
];


@UntilDestroy()
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  standalone: true,
  imports: [
    MatProgressSpinner,
    CommonModule,
    TaskContainerComponent,
    LongClickDirectiveDirective,
  ],
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit, OnDestroy {
  get task() {
    return this._task;
  }

  id!: number;
  private _task!: TaskC; // TODO use resolve
  parentsPath: string[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    public tasksService: TasksService,
    private tasksContainerService: TaskContainerService
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
      this.id = params['id'];
      this.refreshTaskForTheFirstTime();
    });
  }

  private setTask(val: TaskC, updatePath = true) {
    this._task = val;

    this.titleService.setTitle(this.task.getFullDescription());
    if (this.task !== null && updatePath) {
      this.tasksContainerService.getParentsPath(this.task).subscribe((res: string[]) => {
        this.parentsPath = res;
      });
    }
  }

  private refreshTaskForTheFirstTime() {
    if (this.router.getCurrentNavigation()?.extras.state) {
      // TODO duplication
      this.setTask(this.router.getCurrentNavigation()?.extras.state as TaskC);
      return;
    }
    this.refreshTask();
  }

  refreshTask(): void {
    this.isLoading = true;
    this.tasksService.getTask(this.id).subscribe(task => {
      this.setTask(task);
      this.isLoading = false;
    })
  }

  refreshSubtasks$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.questions));

  ngOnDestroy(): void {
    this.isLoading = true;
  }

  onDoneAllClick() {
    if (!this.task) {
      return;
    }
    this.tasksService.finishTask(this.task).subscribe();
    if (this.parentsPath && this.parentsPath.length > 1) {
      const description = this.parentsPath.slice(-2, -1)[0];
      this.goToParentHandler(description);
    }
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
