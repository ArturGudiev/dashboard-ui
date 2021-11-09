import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {Task} from "../../../models/task-class";
import {Epic} from "../../../models/epic";
import {EpicsService} from "../../../services/epics.service";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Story} from "../../../models/story";
import {StoriesService} from "../../../services/stories.service";
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs";
import {CommandsService} from "../../../services/commands.service";
import {Problem} from "../../../models/problem";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {ProblemsService} from "../../../services/problems.service";
import * as _ from "lodash";

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit, OnDestroy {
  epic: Epic;
  subtasks: Task[];
  stories: Story[];
  problems: Problem[];
  parentsPath: string[];
  routeSubscription: Subscription;
  commandsSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private epicsService: EpicsService,
              private tasksService: TasksService,
              private router: Router,
              private storiesService: StoriesService,
              private commandsService: CommandsService,
              private titleService: Title,
              public dialog: MatDialog,
              private problemsService: ProblemsService
  ) {
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.epicsService.getEpic(id).subscribe((epic: Epic) => {
        this.epic = epic;
        this.titleService.setTitle(this.epic.getFullDescription());
        if (this.epic !== null) {
          this.tasksService.getParentsPath(this.epic).subscribe((res: string[]) => {
            this.parentsPath = res;
          });
          this.refreshSubtasks();
          this.refreshSubstories();
          this.refreshProblems();
        }
      })
    });
    this.commandsSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleCommand(state.command);
    })

  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {

    if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
      this.openAddTaskDialog();
    }

  }

  private handleCommand(command: string) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['back', 'b'].includes(arr[0])) {
      this.onGoToNearseParent();
      return;
    }
    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.subtasks.length) {
      this.router.navigate(['task', this.subtasks[+arr[0] - 1]._id]).then();
      return;
    }
    if (['f', 'ft', 'finish-task'].includes(arr[0])) {
      this.finishTaskHandler(args);
      return;
    }
    if (['fp', 'finish-problem'].includes(arr[0])) {
      this.finishProblemHandler(args);
      return;
    }
    if (['problem'].includes(arr[0])) {
      this.addProblem();
      return;
    }
    if (['back', 'b'].includes(arr[0])) {
      this.onGoToNearseParent();
      return;
    }
  }

  private finishProblemHandler(args: string[]) {
    if (!args || args.length === 0) {
      return;
    }
    const index = +args[0];
    if (Number.isInteger(index) && index >= 1 && index <= this.problems.length) {
      const problem = this.problems[index - 1];
      this.solveTheProblem(problem);
    }
  }

  refreshProblems() {
    this.problemsService.getProblems(this.epic.getFullDescription())
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
  }

  addProblem() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Description' }});
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        // this.tasksService.createNewTask(obj).subscribe(() => this.refreshSubtasks());
        const obj = {description: description, tags: [this.epic.getFullDescription()]}
        this.problemsService.createNewProblem(obj).subscribe(() => this.refreshProblems());
      }
    });
  }

  solveTheProblem(problem: Problem) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(problem, solution).subscribe(() => this.refreshProblems());
      }
    });
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
    } else if (args.length > 0 && args[0] && args[0].includes(',')) {
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


  refreshSubtasks() {
    this.tasksService.getTasks(this.epic.getFullDescription()).subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
  }

  addSubtask() {
    this.openAddTaskDialog();
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {parentTask: this.epic},
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const description = result.description;
        const obj = {description: description, tags: [this.epic.getFullDescription()]}
        console.log(obj);
        this.tasksService.createNewTask(obj).subscribe(() => {
          this.tasksService.getTasks(this.epic.getFullDescription()).subscribe(res => {
            this.subtasks = res;
          });
        });
      }
    });
  }


  onSubtaskDoneClick(subtask: Task) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }


  onGoToNearseParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  navigateToStory(story: Story) {
    this.router.navigate(['story', story._id]).then();
  }

  addSubstory() {

  }

  private refreshSubstories() {
    this.storiesService.getStories(this.epic.getFullDescription()).subscribe(stories => {
      this.stories = stories;
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.commandsSubscription.unsubscribe();
  }
}
