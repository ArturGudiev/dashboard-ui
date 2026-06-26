import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { type ModelsStateRequirementFull } from '../../../types/generated';
import { FulfilledStatusIconComponent } from '../../shared/fulfilled-status-icon/fulfilled-status-icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-state-requirements-list',
  templateUrl: './state-requirements-list.component.html',
  styleUrls: ['./state-requirements-list.component.sass'],
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FulfilledStatusIconComponent,
  ],
})
export class StateRequirementsListComponent {
  requirements = input.required<ModelsStateRequirementFull[]>();
  showAddButton = input(true);

  addRequirement = output<void>();

  private readonly router = inject(Router);

  readonly displayedColumns = ['description', 'isFulfilled', 'onceInDays'];

  onRequirementClick(requirement: ModelsStateRequirementFull): void {
    this.router.navigate(['state-requirement', requirement.id]);
  }
}
