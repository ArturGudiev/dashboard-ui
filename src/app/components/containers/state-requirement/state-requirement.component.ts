import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatesService } from '../../../services/task-container-services/states.service';
import {
  getStateRequirementFullDescription,
  type ModelsStateRequirementDetail,
} from '../../../shared/libs/state.lib';
import { FulfilledStatusIconComponent } from '../../shared/fulfilled-status-icon/fulfilled-status-icon.component';
import { StateRequirementChecksListComponent } from '../../lists/state-requirement-checks-list/state-requirement-checks-list.component';

@Component({
  selector: 'app-state-requirement',
  templateUrl: './state-requirement.component.html',
  styleUrls: ['./state-requirement.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    FulfilledStatusIconComponent,
    StateRequirementChecksListComponent,
  ],
})
export class StateRequirementComponent {
  id = input.required<number>();
  stateRequirement = input.required<ModelsStateRequirementDetail>();

  readonly requirementForView = signal<ModelsStateRequirementDetail | null>(null);

  private statesService = inject(StatesService);
  private titleService = inject(Title);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const requirement = this.stateRequirement();
      this.requirementForView.set(requirement);
      if (requirement) {
        this.titleService.setTitle(getStateRequirementFullDescription(requirement));
      }
    });
  }

  reloadRequirement(): void {
    this.statesService
      .getStateRequirement(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((requirement) => this.requirementForView.set(requirement));
  }

  addCheck(): void {
    this.statesService
      .openAddStateRequirementCheckDialog(Number(this.id()))
      .subscribe(() => this.reloadRequirement());
  }

  getFullDescription(requirement: ModelsStateRequirementDetail): string {
    return getStateRequirementFullDescription(requirement);
  }

  goToParentState(): void {
    const stateId = this.requirementForView()?.state_id;
    if (stateId) {
      this.router.navigate(['state', stateId]).then();
      return;
    }
    this.router.navigate(['states']).then();
  }
}
