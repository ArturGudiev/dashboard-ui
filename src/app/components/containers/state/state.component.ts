import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatesService } from '../../../services/task-container-services/states.service';
import { getStateFullDescription, type ModelsStateDetail } from '../../../shared/libs/state.lib';
import { FulfilledStatusIconComponent } from '../../shared/fulfilled-status-icon/fulfilled-status-icon.component';
import { StateRequirementsListComponent } from '../../lists/state-requirements-list/state-requirements-list.component';
import { StatesListComponent } from '../../lists/states-list/states-list.component';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    FulfilledStatusIconComponent,
    StateRequirementsListComponent,
    StatesListComponent,
  ],
})
export class StateComponent {
  id = input.required<number>();
  state = input.required<ModelsStateDetail>();

  readonly stateForView = signal<ModelsStateDetail | null>(null);

  private statesService = inject(StatesService);
  private titleService = inject(Title);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const currentState = this.state();
      this.stateForView.set(currentState);
      if (currentState) {
        this.titleService.setTitle(getStateFullDescription(currentState));
      }
    });
  }

  reloadState(): void {
    this.statesService
      .getState(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentState) => this.stateForView.set(currentState));
  }

  addRequirement(): void {
    this.statesService
      .openAddStateRequirementDialog(Number(this.id()))
      .subscribe(() => this.reloadState());
  }

  getFullDescription(currentState: ModelsStateDetail): string {
    return getStateFullDescription(currentState);
  }

  goToStatesList(): void {
    this.router.navigate(['states']).then();
  }
}
