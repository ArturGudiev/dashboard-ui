import { Component, OnInit } from '@angular/core';
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
  constructor(
    private taskContainerService: TaskContainerService
  ) { }

  ngOnInit(): void {
    console.log('Ng On Init')
    this.addTaskContainer();
  }

  addTaskContainer() {
    const [type, id] = this.taskContainerInput.split(' ');
    if (isTaskContainerType(type)) {
      this.taskContainerService.getTaskContainer(type, +id).subscribe(container => {
        this.taskContainers.push(container);
        console.log(this.taskContainers);
      })
    }
  }

  refreshTaskContainer(taskContainer: TaskContainer, index: number) {
    this.taskContainerService.getTaskContainer(taskContainer.type, taskContainer._id)
      .subscribe(res => this.taskContainers[index] = res);
  }
    

}
