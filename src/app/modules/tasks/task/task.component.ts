import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TasksService} from '../../../services/tasks.service';
import {TaskC} from '../../../models/task-class';
import {getUrlByDescription} from '../../../shared/libs/dashboard.lib';
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs";

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

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  private routerSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              private tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      this.isLoading = true;
      this.id = params['id'];
      this.refreshTask();
    });
  }

  refreshTask() {
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

  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  updateTask() {
    this.tasksService.updateTask(this.task).subscribe((task: TaskC) => this.task = task);
  }
}
