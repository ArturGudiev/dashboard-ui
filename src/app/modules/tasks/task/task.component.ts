import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TasksService} from '../../../services/tasks.service';
import {TaskC} from '../../../models/taskClass';
import {ApiService} from '../../../services/api.service';
import {getUrlByDescription, isTaskDescription} from '../../../shared/libs/dashboard.lib';
import {MatDialog} from '@angular/material/dialog';
import {NewTaskDialogComponent} from '../new-task-dialog/new-task-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit {

  task: TaskC;
  subtasks: TaskC[];
  parentsPath: string[];

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(private route: ActivatedRoute,
              private taskApiService: ApiService,
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
          this.tasksService.getParentsPath(this.task).subscribe((res: string[]) => {
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
      this.openAddTaskDialog();
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


  onParentClick(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls);
    }
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {parentTask: this.task},
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const description = result.description;
        const obj = {description: description, tags: [this.task.getFullDescription()]}
        console.log(obj);
        this.tasksService.createNewTask(obj).subscribe(() => {
          this.tasksService.getTasks(this.task.getFullDescription()).subscribe(res => {
            this.subtasks = res;
          });
        });
      }
    });
  }

  addSubtask() {
    this.openAddTaskDialog();
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }

  openSnackBar() {
    // this._snackBar.openFromComponent('A', 'B');
    this._snackBar.open('message', 'action', {
      duration: 2000
    });
  }

  onDoneAllClick() {
    console.log('onDoneAllClick');

    this.tasksService.finishTask(this.task).subscribe();
    if (this.parentsPath && this.parentsPath.length > 1) {
      const description = this.parentsPath.slice(-2, -1)[0];
      this.onParentClick(description);
    }
  }

  onDownClick() {
    // this.scrollToBottom();
    document.getElementById(`row-${this.subtasks.length - 1}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    // window.scrollTo(0,document.body.scrollHeight);
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.task.getFullDescription()).subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
  }
}
