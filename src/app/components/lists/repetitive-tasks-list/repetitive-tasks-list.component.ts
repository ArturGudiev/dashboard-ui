import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, effect, input, output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

import { MaterialModule } from "../../../modules/material/material.module";
import { ModelsRepetitiveTaskResponse } from "../../../types/generated";

@Component({
  selector: 'dash-repetitive-tasks-list',
  templateUrl: './repetitive-tasks-list.component.html',
  imports: [
    MaterialModule
  ],
  standalone: true,
  styleUrls: ['./repetitive-tasks-list.component.sass']
})
export class RepetitiveTasksListComponent implements AfterViewInit {

  repetitiveTasks = input.required<ModelsRepetitiveTaskResponse[]>();
  onItemExecutedMark = output<ModelsRepetitiveTaskResponse>();

  selection = new SelectionModel<ModelsRepetitiveTaskResponse>(true, []);
  displayedColumns: string[] = ['select', 'description', 'actions'];

  constructor(private router: Router) {
    effect(() => {
      this.dataSource.data = this.repetitiveTasks();
    });
  }

  dataSource = new MatTableDataSource<ModelsRepetitiveTaskResponse>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onRepetitiveTaskClick(repetitiveTask: ModelsRepetitiveTaskResponse) {
    this.router.navigate(['repetitive-task', repetitiveTask.id]);
  }

  finishRepetitiveTask(task: ModelsRepetitiveTaskResponse) {
    console.log('finishRepetitiveTask', task);
    const toMark = confirm(`Do you really want to mark ths task "${task.description}" as done?`);
    if (toMark) {
      this.onItemExecutedMark.emit(task);
    }
  }
}
