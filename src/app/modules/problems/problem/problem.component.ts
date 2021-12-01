import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StoriesService} from "../../../services/stories.service";
import {TasksService} from "../../../services/tasks.service";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {ProblemsService} from "../../../services/problems.service";
import {Problem} from "../../../models/problem";
import {TaskC} from "../../../models/task-class";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {CommandsService} from "../../../services/commands.service";
import * as _ from "lodash";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {Observable, Subscription} from "rxjs";
import {Question} from "../../../models/question";
import {QuestionsService} from "../../../services/questions.service";

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.sass']
})
export class ProblemComponent implements OnInit, OnDestroy {
  problem: Problem;
  subtasks: TaskC[];
  parentsPath: string[];
  problems: Problem[];
  questions: Question[];
  commandSubscription: Subscription;
  routerSubscription: Subscription;
  refreshQuestionsSubscription: Subscription;
  refreshTasksSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
    private problemsService: ProblemsService,
    private commandsService: CommandsService,
    private questionsService: QuestionsService,
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.problemsService.getProblem(id).subscribe((problem: Problem) => {
        this.problem = problem;
        this.titleService.setTitle(this.problem.getFullDescription());
        if (this.problem !== null) {
          this.tasksService.getParentsPath(this.problem)
            .subscribe((res: string[]) => this.parentsPath = res);
          this.refreshSubtasks();
          this.refreshProblems();
          this.refreshQuestions();
        }
      });
    })

    this.commandSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleTaskCommand(state.command);
    });

    this.refreshQuestionsSubscription = this.questionsService.getRefreshQuestionsDataStateChange().subscribe(state => {
      if (this.problem === state.taskContainer) { this.refreshQuestions(); }
      this.refreshTasksSubscription = this.tasksService.getRefreshTasksDataStateChange().subscribe(state => {
        if (this.problem === state.taskContainer) { this.refreshSubtasks(); }
      });
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
      this.openAddTaskDialog();
    }
  }

//--------------------------------qeustions start---------------------------------------------------------
  refreshQuestions(): Observable<Question[]> {
    const questions$ = this.questionsService.getQuestions(this.problem.getFullDescription());
    questions$
      .subscribe((questions: Question[]) => this.questions = questions.filter((q: Question) => !q.answer));
    return questions$;
  }

  addQuestion() {
    this.questionsService.openAddQuestionDialog(this.problem);
  }

  answerTheQuestion(question: Question) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Answer'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.questionsService.answerTheQuestion(question, solution).subscribe(() => this.refreshQuestions());
      }
    });
  }
  //---------------------------------qeustions end----------------------------------------------------------

  refreshProblems(): void {
    this.problemsService.getProblems(this.problem.getFullDescription())
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
  }


  addProblem() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Description'}});
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const obj = {description: description, tags: [this.problem.getFullDescription()]}
        this.problemsService.createNewProblem(obj).subscribe(() => this.refreshProblems());
      }
    });
  }

  solveTheProblem(problem = this.problem) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(problem, solution).subscribe(() => this.refreshProblems());
        if (problem === this.problem) {
          this.onGoToNearestParent();
        }
      }
    });
  }


  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['back', 'b'].includes(arr[0])) {
      this.onGoToNearestParent();
      return;
    }
    // if (['anonymous'].includes(arr[0])) {
    //   this.addAnonymousTaskHandler();
    //   return;
    // }
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
    if (['fp', 'finish-problem'].includes(arr[0])) {
      this.finishProblemHandler(args);
      return;
    }
    if (['r', 'resolve'].includes(arr[0])) {
      this.solveTheProblem();
      return;
    }
    if (['problem'].includes(arr[0])) {
      this.addProblem();
      return;
    }
    // if (['a', 'fta', 'fa', 'finish-all-tasks'].includes(arr[0])) {
    //   this.finishAllTasks();
    //   return;
    // }
    // if (['r', 'res', 'resolve'].includes(arr[0])) {
    //   this.onDoneAllClick();
    //   return;
    // }
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


  refreshSubtasks(): void {
    this.tasksService.getTasks(this.problem.getFullDescription())
      .subscribe(newSubtasks => this.subtasks = newSubtasks);
  }

  onGoToNearestParent() {
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

  addSubtask() {
    this.tasksService.openAddTaskDialog(this.problem);
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {parentTask: this.problem},
        ...NewTaskDialogComponent.DIALOG_OPTIONS
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const description = result.description;
        const obj = {description: description, tags: [this.problem.getFullDescription()]}
        this.tasksService.createNewTask(obj).subscribe(() => {
          this.refreshSubtasks();
        });
      }
    });
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }

  onDoneAllClick() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(this.problem, solution).subscribe();
      }
      if (this.parentsPath && this.parentsPath.length > 1) {
        const description = this.parentsPath.slice(-2, -1)[0];
        this.goToParentHandler(description);
      }
    });
  }

  ngOnDestroy(): void {
    this.commandSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.refreshQuestionsSubscription.unsubscribe();
    this.refreshTasksSubscription.unsubscribe();
  }
}
