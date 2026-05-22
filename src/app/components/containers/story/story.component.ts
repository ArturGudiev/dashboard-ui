import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Story } from '../../../models/story';
import { StoriesService } from '../../../services/task-container-services/stories.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
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
  readonly storyForView = linkedContainerForView(() => this.id(), () => this.story());

  private storiesService = inject(StoriesService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const story = this.storyForView();
      if (story) {
        this.titleService.setTitle(story.getFullDescription());
      }
    });
  }

  reloadStory(): void {
    this.storiesService
      .getStory(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((story) => this.storyForView.set(story));
  }

  updateStory(): void {
    const story = this.storyForView();
    if (!story) {
      return;
    }
    this.storiesService
      .updateStory(story)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.storyForView.set(updated));
  }
}
