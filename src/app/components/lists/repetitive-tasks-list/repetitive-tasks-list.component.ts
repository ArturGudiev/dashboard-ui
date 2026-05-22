import { SelectionModel } from '@angular/cdk/collections';
import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, output, ViewChild } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from '@angular/router';

import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { RepetitiveTasksService } from "../../../services/task-container-services/repetitive-tasks.service";
import { type ModelsRepetitiveTaskResponse } from "../../../types/generated";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dash-repetitive-tasks-list',
  templateUrl: './repetitive-tasks-list.component.html',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
  styleUrls: ['./repetitive-tasks-list.component.sass']
})
export class RepetitiveTasksListComponent implements AfterViewInit {
  repetitiveTasks = input.required<ModelsRepetitiveTaskResponse[]>();
  updateList = output<void>();
  onItemExecutedMark = output<ModelsRepetitiveTaskResponse>();
  repetitiveTasksService = inject(RepetitiveTasksService);
  readonly selection = new SelectionModel<ModelsRepetitiveTaskResponse>(true, []);
  readonly displayedColumns: string[] = ['select', 'description', 'actions'];
  readonly dataSource = new MatTableDataSource<ModelsRepetitiveTaskResponse>([]);

  constructor(private router: Router) {
    effect(() => {
      this.dataSource.data = this.repetitiveTasks();
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onRepetitiveTaskClick(repetitiveTask: ModelsRepetitiveTaskResponse) {
    this.router.navigate(['repetitive-task', repetitiveTask.id]);
  }

  finishRepetitiveTask(task: ModelsRepetitiveTaskResponse) {
    const toMark = confirm(`Do you really want to mark ths task "${task.description}" as done?`);
    if (toMark) {
      this.onItemExecutedMark.emit(task);
    }
  }

  addRepetitiveTask() {
    this.repetitiveTasksService.openAddRepetitiveTaskDialog().subscribe(() => {
      this.updateList.emit();
    });
  }

}
