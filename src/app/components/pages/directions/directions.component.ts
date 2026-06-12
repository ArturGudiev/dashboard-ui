import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DirectionsService } from '../../../services/task-container-services/directions.service';
import { DirectionsListComponent } from '../../lists/directions-list/directions-list.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-directions',
  standalone: true,
  imports: [AsyncPipe, DirectionsListComponent],
  templateUrl: './directions.component.html',
})
export class DirectionsComponent {
  private directionsService = inject(DirectionsService);

  directions$ = this.directionsService.getAllDirections();

  updateList(): void {
    this.directions$ = this.directionsService.getAllDirections();
  }
}
