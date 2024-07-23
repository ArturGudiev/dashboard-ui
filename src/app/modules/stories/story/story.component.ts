import {Component, OnDestroy, OnInit} from '@angular/core';
import {Story} from "../../../models/story";
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {StoriesService} from "../../../services/stories.service";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs";
import { TaskC } from "../../../models/task-class";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit, OnDestroy {
  id: number;
  story: Story;
  parentsPath: string[];
  isLoading = true;

  routerSubscription: Subscription;
  refreshSubtasks$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.tasks));

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private router: Router,
    private titleService: Title,
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.refreshStory();
    });
  }

  refreshStory() {
    this.isLoading = true;
    this.storiesService.getStory(this.id).subscribe((story: Story) => {
      this.story = story;
      this.titleService.setTitle(this.story.getFullDescription());
      if (this.story !== null) {
        this.tasksService.getParentsPath(this.story).subscribe((res: string[]) => {
          this.parentsPath = res;
        });
      }
      this.isLoading = false;
    })
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  updateStory() {
    // this.storiesService.updateStory(this.task).subscribe((task: TaskC) => this.task = task);
  }

  refreshSubtasks() {
    this.storiesService
      .getStory(this.id)
      .subscribe(story => this.story.tasks = story.tasks)
  }

}
