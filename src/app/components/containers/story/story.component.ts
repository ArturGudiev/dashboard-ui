import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Story } from "../../../models/story";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { map } from "rxjs/operators";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { TaskContainerComponent } from "../task-container/task-container.component";
import { StoriesService } from "../../../services/task-container-services/stories.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@Component({
    selector: 'app-story',
    templateUrl: './story.component.html',
    imports: [
    MatProgressSpinner,
    TaskContainerComponent
],
    styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  id!: number; // TODO add resolvers
  story!: Story; // USE resolvers
  parentsPath = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  refreshSubtasks$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.storiesService.getStory(this.id).pipe(map(e => e.questions));

  private route = inject(ActivatedRoute);
  private storiesService = inject(StoriesService);
  private titleService = inject(Title);
  private taskContainerService = inject(TaskContainerService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.id = params['id'];
      this.refreshStory();
    });
  }

  refreshStory() {
    this.isLoading.set(true);
    this.storiesService.getStory(this.id).subscribe((story: Story) => {
      this.story = story;
      this.titleService.setTitle(this.story.getFullDescription());
      if (this.story !== null) {
        this.taskContainerService.getParentsPath(this.story).subscribe((res: string[]) => {
          this.parentsPath.set(res);
        });
      }
      this.isLoading.set(false);
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
