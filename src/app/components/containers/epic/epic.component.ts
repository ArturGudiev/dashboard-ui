import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Epic } from '../../../models/epic';
import { EpicsService } from '../../../services/task-container-services/epics.service';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./epic.component.sass'],
})
export class EpicComponent {
  epicId = input.required<number>();
  epic = input.required<Epic>();

  /** Route param may arrive as string; epic.id is always a number. */
  private readonly routeEpicId = computed(() => Number(this.epicId()));

  private currentEpic = signal<Epic | undefined>(undefined);

  readonly viewEpic = computed(() => {
    const routeId = this.routeEpicId();
    const cur = this.currentEpic();
    if (cur != null && cur.id === routeId) {
      return cur;
    }
    const resolved = this.epic();
    return resolved.id === routeId ? resolved : undefined;
  });

  private epicsService = inject(EpicsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect((onCleanup) => {
      const routeId = this.routeEpicId();
      const resolved = this.epic();

      if (resolved.id === routeId) {
        this.currentEpic.set(resolved);
        return;
      }

      // Resolver/input can lag behind route param on same-component navigation.
      const sub = this.epicsService.getEpic(routeId).subscribe((epic) => {
        if (this.routeEpicId() === routeId) {
          this.currentEpic.set(epic);
        }
      });
      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      const e = this.viewEpic();
      if (e != null) {
        this.titleService.setTitle(e.getFullDescription());
      }
    });
  }

  reloadEpic(): void {
    const routeId = this.routeEpicId();
    this.epicsService
      .getEpic(routeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((epic) => {
        if (this.routeEpicId() === routeId) {
          this.currentEpic.set(epic);
        }
      });
  }

  updateEpic(): void {
    // TODO
  }
}
