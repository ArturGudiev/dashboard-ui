import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TaskC} from "../../../models/task-class";
import {SelectionModel} from "@angular/cdk/collections";
import {TasksService} from "../../../services/tasks.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-subtasks',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.sass']
})
export class SubtasksComponent implements OnInit, OnChanges {
  @Input() subtasks: TaskC[];
  @Output() refreshSubtasks = new EventEmitter();
  @Output() addSubtask = new EventEmitter();
  @Output() onSubtaskDoneClick = new EventEmitter();
  selection = new SelectionModel<TaskC>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];
  constructor(private tasksService: TasksService,
              private router: Router) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.subtasks.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.subtasks);
  }

  onFinishTasksClick() {
    this.tasksService.finishTasks(this.selection.selected).subscribe(
      {
        next: () => {
          this.selection.clear();
          this.refreshSubtasks.emit();
        }
      }
    );
  }

  onFinishAllTasksClick() {
    this.selection.clear();
    const subtasks = this.subtasks;
    this.subtasks = [];
    this.tasksService.finishTasks(subtasks).subscribe(
      () => this.refreshSubtasks.emit());
  }

  onSubtaskClick(task: TaskC) {
    this.router.navigate(['task', task._id]).then();
  }


}
