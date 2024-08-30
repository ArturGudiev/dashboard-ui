import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TaskC } from "../../../models/task-class";
import { TasksService } from "../../../services/tasks.service";
import { Observable } from "rxjs";
import { MaterialModule } from "../../../modules/material/material.module";
import { TasksListComponent } from "../../lists/tasks-list/tasks-list.component";
import { TaskContainer } from "../../../models/interfaces/task-container";

@Component({
  selector: 'app-multitasking-item',
  templateUrl: './multitasking-item.component.html',
  standalone: true,
  imports: [
    MaterialModule,
    TasksListComponent
  ],
  styleUrls: ['./multitasking-item.component.sass']
})
export class MultitaskingItemComponent implements OnInit, OnChanges {
  @Input() taskContainer!: TaskContainer;
  @Input() refreshTasks$!: () => Observable<number[]>;
  @Output() refreshTaskContainer = new EventEmitter();
  @Output() remoteItem = new EventEmitter();

  tasks: TaskC[] = [];
  constructor(
    private tasksService: TasksService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskContainer']) {
      this.refreshSubtasks();
    }

  }

  ngOnInit(): void {
    this.refreshSubtasks();
    this.tasksService.getTasks(this.taskContainer.tasks).subscribe(res => this.tasks = res)
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.taskContainer.tasks).subscribe((newSubtasks ) => {
      this.tasks = newSubtasks;
    });
  }

  refreshTasks() {
    this.refreshTasks$().subscribe(tasks => {
      this.taskContainer.tasks = tasks;
      this.tasksService.getTasks(tasks).subscribe(res => this.tasks = res);
    })
  }
}
