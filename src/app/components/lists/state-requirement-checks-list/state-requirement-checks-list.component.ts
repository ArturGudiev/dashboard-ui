import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { type EntStateRequirementCheck } from '../../../types/generated';
import { FulfilledStatusIconComponent } from '../../shared/fulfilled-status-icon/fulfilled-status-icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-state-requirement-checks-list',
  templateUrl: './state-requirement-checks-list.component.html',
  styleUrls: ['./state-requirement-checks-list.component.sass'],
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FulfilledStatusIconComponent,
  ],
})
export class StateRequirementChecksListComponent {
  checks = input.required<EntStateRequirementCheck[]>();
  showAddButton = input(true);

  addCheck = output<void>();

  readonly displayedColumns = ['dateTime', 'isFulfilled'];
}
