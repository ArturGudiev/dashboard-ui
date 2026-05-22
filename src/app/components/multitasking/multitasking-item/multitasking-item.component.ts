import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';

import { type TaskC } from "../../../models/task-class";

import { type Observable } from "rxjs";

import { MatIconButton } from "@angular/material/button";

import { MatIcon } from "@angular/material/icon";

import { TasksListComponent } from "../../lists/tasks-list/tasks-list.component";

import { type TaskContainer } from "../../../models/interfaces/task-container";

import { TasksService } from "../../../services/task-container-services/tasks.service";



@Component({
    selector: 'app-multitasking-item',
    standalone: true,

    templateUrl: './multitasking-item.component.html',
    imports: [
        MatIconButton,
        MatIcon,
        TasksListComponent
    ],

    styleUrls: ['./multitasking-item.component.sass'],

    changeDetection: ChangeDetectionStrategy.OnPush,

})

export class MultitaskingItemComponent {

  taskContainer = input.required<TaskContainer>();
  refreshTasks$ = input.required<() => Observable<number[]>>();
  refreshTaskContainer = output<void>();
  remoteItem = output<void>();

  readonly tasks = signal<TaskC[]>([]);
  private tasksService = inject(TasksService);

  constructor() {

    effect(() => {
      this.taskContainer();
      this.refreshSubtasks();
    });

  }



  refreshSubtasks() {
    this.tasksService.getTasks(this.taskContainer().tasks).subscribe((newSubtasks) => {
      this.tasks.set(newSubtasks);

    });

  }



  refreshTasks() {
    this.refreshTasks$()().subscribe(tasks => {
      this.taskContainer().tasks = tasks;
      this.tasksService.getTasks(tasks).subscribe(res => this.tasks.set(res));
    })

  }

}

