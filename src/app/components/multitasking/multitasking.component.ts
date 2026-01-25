import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { isNumber } from 'lodash';
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { MaterialModule } from "../../modules/material/material.module";
import { NgForOf } from "@angular/common";
import { MultitaskingItemComponent } from "./multitasking-item/multitasking-item.component";
import { TaskContainer } from "../../models/interfaces/task-container";
import { isTaskContainerType } from "../../models/interfaces/types";
import { TaskContainerService } from "../../services/task-container-services/task-container.service";
import { TasksService } from "../../services/task-container-services/tasks.service";

@Component({
  selector: 'app-multitasking',
  templateUrl: './multitasking.component.html',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    NgForOf,
    MultitaskingItemComponent
  ],
  styleUrls: ['./multitasking.component.sass']
})
export class MultitaskingComponent implements OnInit {
  taskContainers: TaskContainer[] = [];
  taskContainerInput = '';
  inputFormControl = new FormControl('');
  constructor(
    private taskContainerService: TaskContainerService,
    private tasksService: TasksService,
  ) { }

  ngOnInit(): void {
  }

  getTaskContainerRefreshTasks(container: TaskContainer): () => Observable<number[]> {
    if (container.getTaskContainerDescription()[0] === "task") {
      return () => this.tasksService.getTask(container.id).pipe(map(e => e.tasks));
    }
    return () => of([]);
  }

  addTaskContainer() {
    const value = this.inputFormControl.value;
    if (!value) {
      return;
    }
    console.log('addTaskContainer', value);
    if (!value.includes(' ') ) {
      if (isNumber(+value)) {
        this.taskContainerService.getTaskContainer('task', +value)
          .subscribe(container => {
            if (container) {
              this.taskContainers.push(container);
            }
          })
      }
      return;
    }
    let [type, id] = value.split(' ');
    if(type === 'p') {
      type = 'problem';
    }
    if(type === 't') {
      type = 'task';
    }
    if(type === 'q') {
      type = 'question';
    }
    if(type === 's') {
      type = 'story';
    }
    if (isTaskContainerType(type)) {
      this.taskContainerService.getTaskContainer(type, +id).subscribe(container => {
        if (container)
        this.taskContainers.push(container);
      })
    }
  }

  refreshTaskContainer(taskContainer: TaskContainer, index: number) {
    this.taskContainerService.getTaskContainer(taskContainer.type, taskContainer.id)
      .subscribe(res => {
        if (res) {
          this.taskContainers[index] = res;
        }
      });
  }

  /**
   * Removes container from the taskContainers by index
   * @param index
   */
  removeItem(index: number) {
    this.taskContainers.splice(index, 1);
  }

}
