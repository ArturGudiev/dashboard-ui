import * as _ from 'lodash';
import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TasksService} from '../../../services/tasks.service';
import {TaskC} from '../../../models/task-class';
import {ApiService} from '../../../services/api.service';
import {getUrlByDescription} from '../../../shared/libs/dashboard.lib';
import {MatDialog} from '@angular/material/dialog';
import {NewTaskDialogComponent} from '../new-task-dialog/new-task-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommandsService} from "../../../services/commands.service";
import {Title} from "@angular/platform-browser";
import { Problem } from 'src/app/models/problem';
import {ProblemsService} from "../../../services/problems.service";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit {

  task: TaskC;
  subtasks: TaskC[];
  problems: Problem[];
  parentsPath: string[];

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(private route: ActivatedRoute,
              private taskApiService: ApiService,
              private router: Router,
              public dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private titleService: Title,
              private commandsService: CommandsService,
              private problemsService: ProblemsService,
              private tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.tasksService.getTask(id).subscribe(task => {
        this.task = task;
        this.titleService.setTitle(this.task.getFullDescription());
        if (this.task !== null) {
          this.tasksService.getParentsPath(this.task).subscribe((res: string[]) => {
            this.parentsPath = res;
          });
          this.refreshSubtasks();
          this.refreshProblems();
        }

      })
      // console.log('AAAA', this.task);
    });
    this.commandsService.getDataStateChange().subscribe( state => {
      this.handleTaskCommand(state.command);
    })
  }

  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['back', 'b'].includes(arr[0])) {
      this.onGoToNearestParent();
      return;
    }
    if (['anonymous'].includes(arr[0])) {
      this.addAnonymousTaskHandler();
      return;
    }
    // if (arr.length === 1 && arr[0].startsWith('f')) {
    //   const newCommand = command.slice(1);
    //   const newArgs = newCommand.split(' ');
    //   this.finishTaskHandler(newArgs);
    //   return;
    // }
    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.subtasks.length) {
      this.router.navigate(['task', this.subtasks[+arr[0] - 1]._id]).then();
      return;
    }
    if (['f', 'ft', 'finish-task'].includes(arr[0])) {
      this.finishTaskHandler(args);
      return;
    }
    if (['a', 'fta', 'fa', 'finish-all-tasks'].includes(arr[0])) {
      this.finishAllTasks();
      return;
    }
    if (['r', 'res', 'resolve'].includes(arr[0])) {
      this.onDoneAllClick();
      return;
    }
  }

  private addAnonymousTaskHandler() {
    this.tasksService.addAnonymousTask().subscribe();
  }

  finishAllTasks() {
    const subtasks = this.subtasks;
    this.subtasks = [];
    this.tasksService.finishTasks(subtasks).subscribe(() => this.refreshSubtasks());
  }



  private finishTaskHandler(args: string[]) {
    if (!args || args.length === 0) {
      return;
    }
    if (args.length > 0 && args[0] && /^\d+-\d+$/.test(args[0])) {
      const numbers = args[0].split('-');
      const num1 = +numbers[0] - 1;
      const num2 = +numbers[1] - 1;
      const rangeNumbers = _.range(num1, num2 + 1);
      const tasksToFinish = rangeNumbers.map((number: number) => this.subtasks[number]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshSubtasks());
    }
    else if (args.length > 0 && args[0] && args[0].includes(',')) {
      const numbers = args[0].split(',').map(str => +str);
      const tasksToFinish = numbers.map((number: number) => this.subtasks[number - 1]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshSubtasks());
    } else {
      const index = +args[0];
      if (Number.isInteger(index) && index >= 1 && index <= this.subtasks.length) {
        this.tasksService.finishTask(this.subtasks[index - 1]).subscribe(() => this.refreshSubtasks());
      }
    }
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
        this.tasksService.createNewTask(obj).subscribe(() => this.refreshSubtasks());
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
    this.tasksService.finishTask(this.task).subscribe();
    if (this.parentsPath && this.parentsPath.length > 1) {
      const description = this.parentsPath.slice(-2, -1)[0];
      this.goToParentHandler(description);
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

  refreshProblems() {
    this.problemsService.getProblems(this.task.getFullDescription())
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls);
    }
  }


  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  addProblem() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Description' }});
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        // this.tasksService.createNewTask(obj).subscribe(() => this.refreshSubtasks());
        const obj = {description: description, tags: [this.task.getFullDescription()]}
        this.problemsService.createNewProblem(obj).subscribe(() => this.refreshProblems());
      }
    });
  }

  onProblemSolvedClick(problem: Problem) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Solution' }});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(problem, solution).subscribe(() => this.refreshProblems());
      }
    });
  }
}
