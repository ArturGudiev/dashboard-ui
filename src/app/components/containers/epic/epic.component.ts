import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from "@angular/platform-browser";
import { Epic } from "../../../models/epic";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { of } from "rxjs";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { TaskContainerSignalComponent } from "../task-container-signal/task-container-signal.component";

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  imports: [
    MatProgressSpinner,
    TaskContainerSignalComponent
  ],
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent {

  epicId = input.required<number>();

  epicResource = rxResource<Epic, { id: number }>({
    params: () => ({ id: this.epicId() ?? 0 }),
    stream: ({ params }) => this.epicsService.getEpic(params.id),
  });

  parentsPathResource = rxResource<string[], { epic: Epic | null }>({
    params: () => ({ epic: this.epicResource.value() ?? null }),
    stream: ({ params }) => {
      if (!params.epic) {
        return of([]);
      }
      return this.taskContainerService.getParentsPath(params.epic);
    },
  });

  /** Survives rxResource reload so the page does not swap to a spinner (and lose scroll). */
  private lastEpic = signal<Epic | undefined>(undefined);
  private lastParentsPath = signal<string[]>([]);
  private staleCacheEpicId: number | null = null;

  /** Full-page spinner only before we have ever resolved this route's epic. */
  readonly showInitialLoadSpinner = computed(() => {
    const loading = this.epicResource.isLoading();
    const noLive = this.epicResource.value() == null;
    const noStale = this.lastEpic() == null;
    return loading && noLive && noStale;
  });

  readonly viewEpic = computed(() => this.epicResource.value() ?? this.lastEpic());

  readonly viewParentsPath = computed(() => {
    const live = this.parentsPathResource.value() ?? [];
    if (
      this.epicResource.isLoading()
      && this.epicResource.value() == null
      && this.lastEpic() != null
    ) {
      return this.lastParentsPath();
    }
    return live.length > 0 ? live : this.lastParentsPath();
  });

  private epicsService = inject(EpicsService);
  private titleService = inject(Title);
  private taskContainerService = inject(TaskContainerService);

  constructor() {
    effect(() => {
      const id = this.epicId();
      if (this.staleCacheEpicId !== id) {
        this.staleCacheEpicId = id;
        this.lastEpic.set(undefined);
        this.lastParentsPath.set([]);
      }
    });

    effect(() => {
      const e = this.epicResource.value();
      if (e != null) {
        this.lastEpic.set(e);
      }
    });

    effect(() => {
      const hasLiveEpic = this.epicResource.value() != null;
      const path = this.parentsPathResource.value();
      if (hasLiveEpic && path != null) {
        this.lastParentsPath.set(path);
      }
    });
  }

  updateEpic() { // TODO 
  //   if (!this.epic) {
  //     return;
  //   }
  //   this.epicsService.updateEpic(this.epic)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((updatedEpic: Epic) => this.epic = updatedEpic);
  }
}
