import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { LongTasksListComponent } from '../../lists/long-tasks-list/long-tasks-list.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-long-tasks',
  standalone: true,
  imports: [
    AsyncPipe,
    LongTasksListComponent,
  ],
  templateUrl: './long-tasks.component.html',
})
export class LongTasksComponent {
  private longTasksService = inject(LongTasksService);

  longTasks$ = this.longTasksService.getAllLongTasks();

  updateList(): void {
    this.longTasks$ = this.longTasksService.getAllLongTasks();
  }
}
