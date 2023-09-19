import {Component, OnDestroy, OnInit} from '@angular/core';
import {Story} from "../../../models/story";
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {StoriesService} from "../../../services/stories.service";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit, OnDestroy {
  story: Story;
  parentsPath: string[];
  isLoading = true;

  routerSubscription: Subscription;
  private id: number;

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

  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

}
