import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TasksService} from '../../../services/tasks.service';
import {TaskC} from '../../../models/taskClass';
import {TasksApiService} from '../../../services/tasks-api.service';
import {isTaskDescription} from '../../../shared/libs/dashboard.lib';
import {MatDialog} from '@angular/material/dialog';
import {NewTaskDialogComponent} from '../new-task-dialog/new-task-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit {

  task: TaskC;
  subtasks: TaskC[];
  parentsPath: any;
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];

  selection = new SelectionModel<TaskC>(true, []);

  constructor(private route: ActivatedRoute,
              private taskApiService: TasksApiService,
              private router: Router,
              public dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.tasksService.getTask(id).subscribe(task => {
        this.task = task;
        if (this.task !== null) {
          this.tasksService.getParentsPath(this.task).subscribe(res => {
            this.parentsPath = res;
          });
          this.tasksService.getTasks(this.task.getFullDescription()).subscribe(res => {
            this.subtasks = res;
          });
        }

      })
      // console.log('AAAA', this.task);
    });
  }

  // @HostListener('keydown.alt.u', ['$event'])
  // onKeyDown(event: KeyboardEvent) {
  //   // optionally use preventDefault() if your combination
  //   // triggers other events (moving focus in case of Shift+Tab)
  //   // e.preventDefault();
  //   console.log('alt and u ');
  // }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {

    if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
      this.openDialog();
    }

    // if (event.key === 'u' && this.parentsPath.length > 1) {
    //   console.log('AAAA', this.parentsPath.slice(-2));
    //   // this.onParentClick(this.parentsPath.slice(-2)[0]); // todo refactor
    // }
    //
    // if (event.keyCode === KEY_CODE.LEFT_ARROW) {
    //   this.decrement();
    // }
  }

  onSubtaskClick(task: TaskC) {
    this.router.navigate(['task', task._id]);
  }

  onParentClick(description: string) {
    if (isTaskDescription(description)) {
      const arr = TaskC.DESCRIPTION_REGEX.exec(description)
      if (arr && arr.length > 1) {
        this.router.navigate(['task', +arr[1]]);
      }
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: { parentTask: this.task },
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`in PARENT COMPONENT Dialog result: ${JSON.stringify(result)}`);
        const description = result.description;
        const obj = {description: description, tags: [this.task.getFullDescription()]}
        console.log(obj);
        this.tasksService.createNewTask(obj).subscribe(res => {
          this.tasksService.getTasks(this.task.getFullDescription()).subscribe(res => {
            this.subtasks = res;
          });
        });
      }
    });
  }

  onAddTaskClick() {
    this.openDialog();
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.subtasks);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.subtasks.length;
    return numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: TaskC): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${this.subtasks.indexOf(row) + 1}`;
  }

  onFinishTaskClick() {
    console.log(this.selection.selected);
    this.tasksService.finishTasks(this.selection.selected);
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(
      res => {
        this.tasksService.getTasks(this.task.getFullDescription()).subscribe(res => {
          this.subtasks = res;
        });
      }
    );
  }

  openSnackBar() {
    // this._snackBar.openFromComponent('A', 'B');
    this._snackBar.open('message', 'action', {
      duration: 2000
    });
  }

}
