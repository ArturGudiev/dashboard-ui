import { SelectionModel } from '@angular/cdk/collections';
import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { formatLongTaskProgress } from '../../../shared/libs/long-task.lib';
import { type EntLongTask } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-long-tasks-list',
  templateUrl: './long-tasks-list.component.html',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
  styleUrls: ['./long-tasks-list.component.sass'],
})
export class LongTasksListComponent implements AfterViewInit {
  longTasks = input.required<EntLongTask[]>();
  updateList = output<void>();

  private readonly router = inject(Router);
  private readonly longTasksService = inject(LongTasksService);

  readonly selection = new SelectionModel<EntLongTask>(true, []);
  readonly displayedColumns: string[] = ['select', 'description', 'progress'];
  readonly dataSource = new MatTableDataSource<EntLongTask>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.longTasks();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onLongTaskClick(longTask: EntLongTask): void {
    this.router.navigate(['long-task', longTask.id]);
  }

  addLongTask(): void {
    this.longTasksService.openAddLongTaskDialog().subscribe(() => {
      this.updateList.emit();
    });
  }

  formatProgress(task: EntLongTask): string {
    return formatLongTaskProgress(task);
  }
}
