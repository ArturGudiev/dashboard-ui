import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatesService } from '../../../services/task-container-services/states.service';
import { StatesListComponent } from '../../lists/states-list/states-list.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-states',
  standalone: true,
  imports: [
    AsyncPipe,
    StatesListComponent,
  ],
  templateUrl: './states.component.html',
})
export class StatesComponent {
  private statesService = inject(StatesService);

  states$ = this.statesService.getAllStates();

  updateList(): void {
    this.states$ = this.statesService.getAllStates();
  }
}
