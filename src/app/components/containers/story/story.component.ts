import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Story } from '../../../models/story';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { StoriesService } from '../../../services/task-container-services/stories.service';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  imports: [MatProgressSpinner, TaskContainerSignalComponent],
  styleUrls: ['./story.component.sass'],
})
export class StoryComponent {
  id = input.required<number>();

  storyResource = rxResource<Story, { id: number }>({
    params: () => ({ id: this.id() ?? 0 }),
    stream: ({ params }) => this.storiesService.getStory(params.id),
  });

  private lastStory = signal<Story | undefined>(undefined);
  private staleCacheStoryId: number | null = null;

  readonly showInitialLoadSpinner = computed(() => {
    const loading = this.storyResource.isLoading();
    const noLive = this.storyResource.value() == null;
    const noStale = this.lastStory() == null;
    return loading && noLive && noStale;
  });

  readonly viewStory = computed(() => this.storyResource.value() ?? this.lastStory());

  private storiesService = inject(StoriesService);
  private titleService = inject(Title);

  constructor() {
    effect(() => {
      const routeId = this.id();
      if (this.staleCacheStoryId !== routeId) {
        this.staleCacheStoryId = routeId;
        this.lastStory.set(undefined);
      }
    });

    effect(() => {
      const s = this.storyResource.value();
      if (s != null) {
        this.lastStory.set(s);
        this.titleService.setTitle(s.getFullDescription());
      }
    });
  }

  updateStory() {
    const story = this.viewStory();
    if (!story) {
      return;
    }
    this.storiesService.updateStory(story).subscribe((updated: Story) => this.lastStory.set(updated));
  }
}
