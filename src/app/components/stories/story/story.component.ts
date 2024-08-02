import { Component, OnDestroy, OnInit } from '@angular/core';
import { Story } from "../../../models/story";
import { ActivatedRoute, Router } from "@angular/router";
import { TasksService } from "../../../services/tasks.service";
import { StoriesService } from "../../../services/stories.service";
import { Title } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SharedModule } from "../../../shared/shared.module";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { NgIf } from "@angular/common";

@UntilDestroy()
@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  standalone: true,
  imports: [
    SharedModule,
    MatProgressSpinner,
    NgIf
  ],
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  id!: number; // TODO add resolvers
  story!: Story; // USE resolvers
  parentsPath: string[] = [];
  isLoading = true;

  refreshSubtasks$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.tasks));

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private titleService: Title,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
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

  refreshSubtasks() {
    this.storiesService
      .getStory(this.id)
      .subscribe(story => this.story.tasks = story.tasks)
  }

}
