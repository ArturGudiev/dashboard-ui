import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TaskContainer } from 'src/app/interfaces/task-container';
import { TaskC } from 'src/app/models/task-class';
import { TasksService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-multitasking-item',
  templateUrl: './multitasking-item.component.html',
  styleUrls: ['./multitasking-item.component.sass']
})
export class MultitaskingItemComponent implements OnInit, OnChanges {
  @Input() taskContainer: TaskContainer;
  @Output() refreshTaskContainer = new EventEmitter();
  @Output() remoteItem = new EventEmitter();
  subtasks: TaskC[] = [];
  constructor(
    private tasksService: TasksService
  ) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskContainer) {
      this.refreshSubtasks();
    }
    
  }

  ngOnInit(): void {
    this.refreshSubtasks();
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.taskContainer.tasks).subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask)
      .subscribe(() => this.refreshSubtasks());
  }

  addSubtask() {
    this.tasksService.openAddTaskDialog(this.taskContainer)
      .subscribe((responseObj: any) => {
        this.tasksService.addTaskDialogOpened = false;
        if (!responseObj) {
          return;
        }
        const description = responseObj.description;
        if (description) {
          const obj: any = {
            description: description,
            tags: [],
            done: false,
            notes: responseObj.notes,
            parents: [this.taskContainer.getTaskContainerDescription()]
          }
          this.tasksService.createNewTask(obj)
            .subscribe(() => this.refreshTaskContainer.emit())
        }
      });
  }
    
}
