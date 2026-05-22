import { ChangeDetectionStrategy, Component, type OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { isNumber } from 'lodash';
import { type Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { TaskContainer } from "../../models/interfaces/task-container";
import { isTaskContainerType } from "../../models/interfaces/types";
import { TaskContainerService } from "../../services/task-container-services/task-container.service";
import { TasksService } from "../../services/task-container-services/tasks.service";
import { MultitaskingItemComponent } from "./multitasking-item/multitasking-item.component";

@Component({
    selector: 'app-multitasking',
    standalone: true,
    templateUrl: './multitasking.component.html',
    imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MultitaskingItemComponent
],
    styleUrls: ['./multitasking.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultitaskingComponent implements OnInit {
  readonly taskContainers = signal<TaskContainer[]>([]);
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
              this.taskContainers.update(containers => [...containers, container]);
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
        this.taskContainers.update(containers => [...containers, container]);
      })
    }
  }

  refreshTaskContainer(taskContainer: TaskContainer, index: number) {
    this.taskContainerService.getTaskContainer(taskContainer.type, taskContainer.id)
      .subscribe(res => {
        if (res) {
          this.taskContainers.update(containers => {
            const nextContainers = [...containers];
            nextContainers[index] = res;
            return nextContainers;
          });
        }
      });
  }

  /**
   * Removes container from the taskContainers by index
   * @param index
   */
  removeItem(index: number) {
    this.taskContainers.update(containers => containers.filter((_, currentIndex) => currentIndex !== index));
  }

}
