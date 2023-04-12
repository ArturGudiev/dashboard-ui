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
      this.isLoading = true;
      this.id = params['id'];
      this.refreshTask();
    });
  }

  refreshTask() {
    this.tasksService.getTask(this.id).subscribe(task => {
      this.task = task;
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

  finishAllTasks() {
    const subtasks = this.subtasks;
    this.subtasks = [];
    this.tasksService.finishTasks(subtasks).subscribe(() => this.refreshSubtasks());
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }

  openSnackBar() {
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

  updateNotes(newNotesValue: string) {
    this.task.notes = newNotesValue;
    this.tasksService.updateTask(this.task).subscribe((task: TaskC) => {
      this.task.notes = task.notes;
    });
  }

  updateTask() {
    this.tasksService.updateTask(this.task).subscribe((task: TaskC) => this.task = task);
  }
}
