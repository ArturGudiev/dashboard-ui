import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TaskContainer} from "../../../interfaces/task-container";

@Component({
  selector: 'app-task-container-description',
  templateUrl: './task-container-description.component.html',
  styleUrls: ['./task-container-description.component.sass']
})
export class TaskContainerDescriptionComponent implements OnInit {
  @Input() taskContainer: TaskContainer;
  @Input() showDoneAll = true;
  @Output() onDoneAllClick = new EventEmitter();
  @Output() goToParent = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

}
