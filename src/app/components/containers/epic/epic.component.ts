import { Component, DestroyRef, effect, inject, input, linkedSignal } from '@angular/core';
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
  /** From route param `epicId` (withComponentInputBinding). */
  epicId = input.required<number>();

  /** From route resolve `epic` — refreshed when `epicId` changes (`runGuardsAndResolvers: 'paramsChange'`). */
  epic = input.required<Epic>();

  /** Resolver value, or last `reloadEpic()` result (e.g. after adding a task). */
  readonly epicForView = linkedSignal(() => this.epic());

  private epicsService = inject(EpicsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.titleService.setTitle(this.epicForView().getFullDescription());
    });
  }

  reloadEpic(): void {
    this.epicsService
      .getEpic(Number(this.epicId()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((epic) => this.epicForView.set(epic));
  }

  updateEpic(): void {
    // TODO
  }
}
