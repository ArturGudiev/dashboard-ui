import { Component, DestroyRef, effect, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Story } from '../../../models/story';
import { StoriesService } from '../../../services/task-container-services/stories.service';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./story.component.sass'],
})
export class StoryComponent {
  /** From route param `id` (withComponentInputBinding). */
  id = input.required<number>();

  /** From route resolve `story` — refreshed when `id` changes (`runGuardsAndResolvers: 'paramsChange'`). */
  story = input.required<Story>();

  /** Resolver value, or last `reloadStory()` result (e.g. after adding a task). */
  readonly storyForView = linkedSignal(() => this.story());

  private storiesService = inject(StoriesService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.titleService.setTitle(this.storyForView().getFullDescription());
    });
  }

  reloadStory(): void {
    this.storiesService
      .getStory(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((story) => this.storyForView.set(story));
  }

  updateStory(): void {
    this.storiesService
      .updateStory(this.storyForView())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.storyForView.set(updated));
  }
}
