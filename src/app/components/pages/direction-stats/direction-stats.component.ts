import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { type Direction } from '../../../models/direction';
import { DirectionsService } from '../../../services/task-container-services/directions.service';
import { type ModelsDirectionStatsEntry } from '../../../types/generated';

@Component({
  selector: 'app-direction-stats',
  templateUrl: './direction-stats.component.html',
  styleUrls: ['./direction-stats.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatTableModule],
})
export class DirectionStatsComponent {
  id = input.required<number>();
  direction = input.required<Direction>();

  readonly stats = signal<ModelsDirectionStatsEntry[]>([]);
  readonly columns = ['date', 'text'];

  private directionsService = inject(DirectionsService);
  private titleService = inject(Title);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const direction = this.direction();
      if (direction) {
        this.titleService.setTitle(`${direction.getFullDescription()} — stats`);
      }
      this.loadStats();
    });
  }

  loadStats(): void {
    this.directionsService
      .getStats(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.stats.set(items));
  }

  goBack(): void {
    this.router.navigate(['direction', this.id()]).then();
  }
}
