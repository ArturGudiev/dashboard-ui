import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { type Direction } from '../../../models/direction';
import { DirectionsService } from '../../../services/task-container-services/directions.service';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
import { ModelsLongTaskFull, type EntLongTask } from '../../../types/generated';
import { LongTasksListComponent } from '../../lists/long-tasks-list/long-tasks-list.component';
import { SubDirectionsComponent } from '../../lists/sub-directions/sub-directions.component';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-direction',
  templateUrl: './direction.component.html',
  styleUrls: ['./direction.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskContainerSignalComponent, SubDirectionsComponent, LongTasksListComponent],
})
export class DirectionComponent {
  id = input.required<number>();
  direction = input.required<Direction>();

  readonly directionForView = linkedContainerForView(() => this.id(), () => this.direction());

  private directionsService = inject(DirectionsService);
  private longTasksService = inject(LongTasksService);
  private titleService = inject(Title);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  childDirectionsResource = rxResource<Direction[], { ids: number[] }>({
    params: () => ({ ids: this.directionForView()?.directions ?? [] }),
    stream: ({ params }) => {
      if (!params.ids.length) {
        return of([]);
      }
      return this.directionsService.getDirectionsByIds(params.ids);
    },
  });

  longTasksResource = rxResource<ModelsLongTaskFull[], { ids: number[] }>({
    params: () => ({ ids: this.directionForView()?.longTasks ?? [] }),
    stream: ({ params }) => {
      if (!params.ids.length) {
        return of([]);
      }
      return this.longTasksService.getLongTasksByIds(params.ids);
    },
  });

  constructor() {
    effect(() => {
      const direction = this.directionForView();
      if (direction) {
        this.titleService.setTitle(direction.getFullDescription());
      }
    });
  }

  reloadDirection(): void {
    this.directionsService
      .getDirection(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((direction) => this.directionForView.set(direction));
  }

  updateDirection(): void {
    const direction = this.directionForView();
    if (!direction) {
      return;
    }
    this.directionsService
      .getDirection(direction.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.directionForView.set(updated));
  }

  addSubmission(): void {
    this.directionsService
      .openAddSubmissionDialog(Number(this.id()))
      .subscribe();
  }

  addLongTask(): void {
    const direction = this.directionForView();
    if (!direction) {
      return;
    }
    this.longTasksService
      .openAddLongTaskDialog({ id: direction.id, type: 'direction' })
      .subscribe(() => this.reloadDirection());
  }

  addSubDirection(): void {
    const direction = this.directionForView();
    if (!direction) {
      return;
    }
    this.directionsService
      .openAddDirectionDialog({ id: direction.id, type: 'direction' })
      .subscribe(() => this.reloadDirection());
  }

  goToStats(): void {
    this.router.navigate(['direction', this.id(), 'stats']).then();
  }

  openDirection(child: Direction): void {
    this.router.navigate(['direction', child.id]).then();
  }
}
