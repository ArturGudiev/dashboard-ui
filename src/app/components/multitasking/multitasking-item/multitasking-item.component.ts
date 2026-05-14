import { Component, effect, inject, input, output } from '@angular/core';
import { TaskC } from "../../../models/task-class";
import { Observable } from "rxjs";
import { MaterialModule } from "../../../modules/material/material.module";
import { TasksListComponent } from "../../lists/tasks-list/tasks-list.component";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { TasksService } from "../../../services/task-container-services/tasks.service";

@Component({
    selector: 'app-multitasking-item',
    templateUrl: './multitasking-item.component.html',
    imports: [
        MaterialModule,
        TasksListComponent
    ],
    styleUrls: ['./multitasking-item.component.sass']
})
export class MultitaskingItemComponent {
  taskContainer = input.required<TaskContainer>();
  refreshTasks$ = input.required<() => Observable<number[]>>();
  refreshTaskContainer = output<void>();
  remoteItem = output<void>();

  tasks: TaskC[] = [];

  private tasksService = inject(TasksService);

  constructor() {
    effect(() => {
      this.refreshSubtasks();
    });
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.taskContainer().tasks).subscribe((newSubtasks) => {
      this.tasks = newSubtasks;
    });
  }

  refreshTasks() {
    this.refreshTasks$()().subscribe(tasks => {
      this.taskContainer().tasks = tasks;
      this.tasksService.getTasks(tasks).subscribe(res => this.tasks = res);
    })
  }
}
