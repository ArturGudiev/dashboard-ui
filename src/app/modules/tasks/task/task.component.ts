import * as _ from 'lodash';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TasksService} from '../../../services/tasks.service';
import {TaskC} from '../../../models/task-class';
import {ApiService} from '../../../services/api.service';
import {getUrlByDescription} from '../../../shared/libs/dashboard.lib';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommandsService} from "../../../services/commands.service";
import {Title} from "@angular/platform-browser";
import {Problem} from 'src/app/models/problem';
import {ProblemsService} from "../../../services/problems.service";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {AlertService} from "../../../services/alert.service";
import {forkJoin, Observable, Subject, Subscription} from "rxjs";
import {Question} from "../../../models/question";
import {QuestionsService} from "../../../services/questions.service";
import {KnowledgeService} from "../../../services/knowledge.service";
import {Definition} from "../../../models/definition";
import {DefinitionDialogComponent} from "../../dialogs/definition/definition-dialog.component";
import {Action} from "../../../models/action";
import {ActionDialogComponent} from "../../dialogs/action-dialog/action-dialog.component";
import {Knowledge} from "../../../models/knowledge";
import {KnowledgeDialogComponent} from "../../dialogs/knowledge-dialog/knowledge-dialog.component";
import {DashboardService} from "../../../services/dashboard.service";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.sass']
})
export class TaskComponent implements OnInit, OnDestroy {
  id: number;
  task: TaskC;
  subtasks: TaskC[];
  problems: Problem[];
  actions: Action[];
  questions: Question[];
  definitions: Definition[];
  parentsPath: string[];
  isLoading = true;
  commandsSubscription: Subscription;

  toggleNotesEditSubject: Subject<void> = new Subject<void>();

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  private routerSubscription: Subscription;
  knowledgeBits: Knowledge[];
  refreshQuestionsSubscription: Subscription;
  refreshTasksSubscription: Subscription;
  refreshProblemsSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private taskApiService: ApiService,
              private router: Router,
              public dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private titleService: Title,
              private dashboardService: DashboardService,
              private commandsService: CommandsService,
              private problemsService: ProblemsService,
              private knowledgeService: KnowledgeService,
              private alertService: AlertService,
              private questionsService: QuestionsService,
              private tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.refreshTask();
    });
    this.refreshQuestionsSubscription = this.questionsService.getRefreshQuestionsDataStateChange().subscribe(state => {
      if (this.task === state.taskContainer) { this.refreshQuestions(); }
    });
    this.refreshTasksSubscription = this.tasksService.getRefreshTasksDataStateChange().subscribe(state => {
      if (this.task === state.taskContainer) { this.refreshSubtasks(); }
    });
    this.refreshProblemsSubscription = this.problemsService.getRefreshProblemsDataStateChange().subscribe(state => {
      if (this.task === state.taskContainer) { this.refreshProblems(); }
    });
    this.commandsSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleTaskCommand(state.command);
    })
  }

  refreshTask() {
    this.tasksService.getTask(this.id).subscribe(task => {
      this.task = task;
      // this.alertService.showAlert(JSON.stringify(task), 30000);
      this.titleService.setTitle(this.task.getFullDescription());
      if (this.task !== null) {
        const parentsPath$ = this.tasksService.getParentsPath(this.task);
        parentsPath$.subscribe((res: string[]) => {
          this.parentsPath = res;
        });
        this.refreshDefinitions();
        this.refreshActions();
        this.refreshKnowledgeBits();
        forkJoin([this.refreshSubtasks(), this.refreshProblems(), this.refreshQuestions()]).subscribe(
          () => this.isLoading = false
        )
      }
    })
  }

  ngOnDestroy(): void {
    this.commandsSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.refreshQuestionsSubscription.unsubscribe();
    this.refreshTasksSubscription.unsubscribe();
    this.refreshProblemsSubscription.unsubscribe();
    this.isLoading = true;
    this.task = null;
  }

  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['back', 'b'].includes(arr[0])) {
      this.onGoToNearestParent();
    }
    if (['anonymous'].includes(arr[0])) {
      this.addAnonymousTaskHandler();
    }
    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.subtasks.length) {
      this.router.navigate(['task', this.subtasks[+arr[0] - 1]._id]).then();
    }
    if (['f', 'ft', 'finish-task'].includes(arr[0])) {
      this.finishTaskHandler(args);
    }
    if (['fp', 'finish-problem'].includes(arr[0])) {
      this.finishProblemHandler(args);
    }
    if (['problem'].includes(arr[0])) {
      this.addProblem();
    }
    if (['definition'].includes(arr[0])) {
      this.addDefinition();
    }
    if (['action', 'act'].includes(arr[0])) {
      this.addAction();
    }
    if (['question'].includes(arr[0])) {
      this.addQuestion();
    }
    if (['a', 'fta', 'fa', 'finish-all-tasks'].includes(arr[0])) {
      this.finishAllTasks();
    }
    if (['r', 'res', 'resolve'].includes(arr[0])) {
      this.onDoneAllClick();
    }
    if (['notes'].includes(arr[0])) {
      this.callEditNotesEvent();
    }
    if (['task'].includes(arr[0])) {
      this.addSubtask();
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
    document.getElementById(`row-${this.subtasks.length - 1}`).scrollIntoView({behavior: 'smooth', block: 'center'});
    // window.scrollTo(0,document.body.scrollHeight);
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  refreshSubtasks() {
    const tasksObservable = this.tasksService.getTasks(this.task.getFullDescription());
    tasksObservable.subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
    return tasksObservable;
  }

  refreshProblems(): Observable<Problem[]> {
    const problems$ = this.problemsService.getProblems(this.task.getFullDescription());
    problems$
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
    return problems$;
  }

  refreshDefinitions(): Observable<Definition[]> {
    const definitions$ = this.knowledgeService.getDefinitions(this.task.getFullDescription());
    definitions$.subscribe(definitions => {
      return this.definitions = definitions;
    });
    return definitions$;
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  addProblem(): void {
    this.problemsService.openAddProblemDialog(this.task);
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.task);
  }

  refreshQuestions(): Observable<Question[]> {
    const questions$ = this.questionsService.getQuestions(this.task.getFullDescription());
    questions$
      .subscribe(questions => this.questions = questions.filter((p: Question) => !p.answer));
    return questions$;
  }

  addQuestion() {
    this.questionsService.openAddQuestionDialog(this.task);
  }

  addSubtask() {
    this.tasksService.openAddTaskDialog(this.task);
  }

  answerTheQuestion(question: Question) {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Answer'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.questionsService.answerTheQuestion(question, solution)
          .subscribe(() => this.refreshQuestions());
      }
    });
  }

  addDefinition() {
    // this.knowledgeService.addDefinition();
    const dialogRef = this.dialog.open(DefinitionDialogComponent, {
      height: '400px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const definitionObject = {name: obj.name, value: obj.value, tags: [this.task.getFullDescription()]}
        this.knowledgeService.createNewDefinition(definitionObject).subscribe(() => this.refreshDefinitions());
      }
    });
  }

  addAction() {
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      height: '600px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const action = {
          name: obj.name,
          value: obj.value,
          tags: [this.task.getFullDescription()],
          extension: obj.extension
        };
        this.knowledgeService.createNewAction(action).subscribe(() => this.refreshActions());
      }
    });
  }

  refreshActions() {
    const actionsSubscription$ = this.knowledgeService.getActions(this.task.getFullDescription());
    actionsSubscription$.subscribe(actions => {
      this.actions = actions;
    });
    return actionsSubscription$;
  }

  refreshKnowledgeBits() {
    const knowledgeBitsSubscription$ = this.knowledgeService.getKnowledgeBits(this.task.getFullDescription());
    knowledgeBitsSubscription$.subscribe(knowledgeBits => this.knowledgeBits = knowledgeBits);
    return knowledgeBitsSubscription$;
  }

  addKnowledge() {
    const dialogRef = this.dialog.open(KnowledgeDialogComponent, {
      height: '600px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const knowledge = {
          name: obj.name,
          value: obj.value,
          tags: [this.task.getFullDescription()],
          extension: obj.extension
        };
        this.knowledgeService.createNewKnowledge(knowledge).subscribe(() => this.refreshKnowledgeBits());
      }
    });
  }

  callEditNotesEvent() {
    this.toggleNotesEditSubject.next();
  }

  updateNotes(newNotesValue: string) {
    this.task.notes = newNotesValue;
    this.tasksService.updateTask(this.task).subscribe((task: TaskC) => {
      this.task.notes = task.notes;
    });
  }
}
