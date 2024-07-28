import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TaskContainer } from "../../../interfaces/task-container";
import { TaskC } from "../../../models/task-class";
import { TasksService } from "../../../services/tasks.service";

@Component({
  selector: 'app-multitasking-item',
  templateUrl: './multitasking-item.component.html',
  styleUrls: ['./multitasking-item.component.sass']
})
export class MultitaskingItemComponent implements OnInit, OnChanges {
  @Input() taskContainer!: TaskContainer;
  @Output() refreshTaskContainer = new EventEmitter();
  @Output() remoteItem = new EventEmitter();
  subtasks: TaskC[] = [];
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
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.taskContainer.tasks).subscribe((newSubtasks ) => {
      this.subtasks = newSubtasks;
    });
  }

}
