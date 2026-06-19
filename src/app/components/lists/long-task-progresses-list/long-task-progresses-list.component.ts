import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { formatLongTaskSingleProgress } from '../../../shared/libs/long-task.lib';
import { type ModelsLongTaskProgress } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-long-task-progresses-list',
  templateUrl: './long-task-progresses-list.component.html',
  styleUrls: ['./long-task-progresses-list.component.sass'],
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class LongTaskProgressesListComponent {
  progresses = input.required<ModelsLongTaskProgress[]>();
  showAddButton = input(true);

  addProgress = output<void>();
  addSubmission = output<ModelsLongTaskProgress>();

  readonly displayedColumns = ['id', 'name', 'add_submission', 'value', 'total', 'units', 'summary'];

  formatSummary(progress: ModelsLongTaskProgress): string {
    return formatLongTaskSingleProgress(progress);
  }
}
