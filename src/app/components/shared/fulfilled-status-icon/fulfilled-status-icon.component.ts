import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fulfilled-status-icon',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (isFulfilled() === true) {
      <mat-icon class="fulfilled-icon fulfilled">check_circle</mat-icon>
    } @else if (isFulfilled() === false) {
      <mat-icon class="fulfilled-icon not-fulfilled">block</mat-icon>
    } @else {
      <mat-icon class="fulfilled-icon unknown">help_outline</mat-icon>
    }
  `,
  styles: [`
    .fulfilled-icon
      font-size: 1.25rem
      width: 1.25rem
      height: 1.25rem
      vertical-align: middle

    .fulfilled
      color: #2e7d32

    .not-fulfilled
      color: #c62828

    .unknown
      color: #757575
  `],
})
export class FulfilledStatusIconComponent {
  isFulfilled = input<boolean | null | undefined>(undefined);
}
