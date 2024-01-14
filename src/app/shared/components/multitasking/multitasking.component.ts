import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isNumber } from 'lodash';
import { TaskContainer } from 'src/app/interfaces/task-container';
import { TaskContainerType, isTaskContainerType } from 'src/app/interfaces/types';
import { TaskContainerService } from 'src/app/services/task-container.service';

@Component({
  selector: 'app-multitasking',
  templateUrl: './multitasking.component.html',
  styleUrls: ['./multitasking.component.sass']
})
export class MultitaskingComponent implements OnInit {
  taskContainers: TaskContainer[] = [];
  taskContainerInput = '';
  inputFormControl = new FormControl('');
  constructor(
    private taskContainerService: TaskContainerService
  ) { }

  ngOnInit(): void {
    // this.addTaskContainer();
    // this.taskContainerService.getTaskContainer('task', 53838)
    //   .subscribe(val => this.taskContainers.push(val));
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
            this.taskContainers.push(container);
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
        this.taskContainers.push(container);
      })
    }
  }

  refreshTaskContainer(taskContainer: TaskContainer, index: number) {
    this.taskContainerService.getTaskContainer(taskContainer.type, taskContainer._id)
      .subscribe(res => this.taskContainers[index] = res);
  }
  
  /**
   * Removes container from the taskContainers by index
   * @param index 
   */
  removeItem(index: number) {
    this.taskContainers.splice(index, 1);
  }  

}
