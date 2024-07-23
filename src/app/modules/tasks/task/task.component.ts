import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TasksService} from '../../../services/tasks.service';
import {TaskC} from '../../../models/task-class';
import {getUrlByDescription} from '../../../shared/libs/dashboard.lib';
import {Title} from "@angular/platform-browser";
import {Observable, Subscription} from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit, OnDestroy {
  id: number;
  task: TaskC;
  parentsPath: string[];
  isLoading = true;

  private routerSubscription: Subscription;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              public tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.refreshTask();
    });
  }

  refreshTask(): void {
    this.isLoading = true;
    this.tasksService.getTask(this.id).subscribe(task => {
      this.task = task;
      this.titleService.setTitle(this.task.getFullDescription());
      if (this.task !== null) {
        this.tasksService.getParentsPath(this.task).subscribe((res: string[]) => {
          this.parentsPath = res;
        });
      }
      this.isLoading = false;
    })
  }

  refreshSubtasks() {
    this.tasksService.getTask(this.id).subscribe(task => this.task.tasks = task.tasks)
  }

  refreshSubtasks$ = () => this.tasksService.getTask(this.id).pipe(map(e => e.tasks));



  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.isLoading = true;
    this.task = null;
  }

  onDoneAllClick() {
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

  updateTask() {
    this.tasksService.updateTask(this.task).subscribe((task: TaskC) => this.task = task);
  }
}
