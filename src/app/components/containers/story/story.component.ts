import { Component, OnInit } from '@angular/core';
import { Story } from "../../../models/story";
import { ActivatedRoute } from "@angular/router";
import { TasksService } from "../../../services/tasks.service";
import { StoriesService } from "../../../services/stories.service";
import { Title } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { NgIf } from "@angular/common";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { TaskContainerService } from "../../../services/task-container.service";

@UntilDestroy()
@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  standalone: true,
  imports: [
    MatProgressSpinner,
    NgIf,
    TaskContainerComponent
  ],
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  id!: number; // TODO add resolvers
  story!: Story; // USE resolvers
  parentsPath: string[] = [];
  isLoading = true;

  refreshSubtasks$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.questions));

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private titleService: Title,
    private taskContainerService: TaskContainerService
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
        this.taskContainerService.getParentsPath(this.story).subscribe((res: string[]) => {
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

  /**
   * Сохранение истории (например, для обновления в базе заметок)
   */
  updateStory() {
    if (!this.story) {
      return;
    }
    this.storiesService.updateStory(this.story).subscribe((story: Story) => this.story = story);
  }

}
