import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Hotkey, HotkeysService } from "angular2-hotkeys";
import * as _ from "lodash";
import { Observable, Subject, Subscription } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Epic } from 'src/app/models/epic';
import { Knowledge } from 'src/app/models/knowledge';
import { EpicsService } from 'src/app/services/epics.service';
import { TaskContainer } from "../../../interfaces/task-container";
import { Action } from "../../../models/action";
import { Problem } from "../../../models/problem";
import { Question } from "../../../models/question";
import { Story } from "../../../models/story";
import { TaskC } from "../../../models/task-class";
import { GetValueDialogComponent } from "../../../modules/dialogs/get-value/get-value-dialog.component";
import { RecordsListDialogComponent } from "../../../modules/dialogs/records-list-dialog/records-list-dialog.component";
import { CommandsService } from "../../../services/commands.service";
import { KnowledgeService } from "../../../services/knowledge.service";
import { ProblemsService } from "../../../services/problems.service";
import { QuestionsService } from "../../../services/questions.service";
import { RecordsService } from "../../../services/records.service";
import { StoriesService } from "../../../services/stories.service";
import { TasksService } from "../../../services/tasks.service";
import { getUrlByDescription } from "../../libs/dashboard.lib";
import { Store } from "@ngxs/store";
import { AppState } from "../../../state/app.state";
import { TaskContainerService } from "../../../services/task-container.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ToastrService } from "ngx-toastr";

@UntilDestroy()
@Component({
  selector: 'app-task-container',
  templateUrl: './task-container.component.html',
  styleUrls: ['./task-container.component.sass']
})
export class TaskContainerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() taskContainer: TaskContainer;
  @Input() parentsPath: string[];
  @Input() showEpics = false;
  @Input() showStories = false;

  @Output() onDoneAllClick = new EventEmitter();
  @Output() updateTaskContainer = new EventEmitter();
  @Output() refreshTaskContainer = new EventEmitter();
  @Output() refreshTaskContainerTasksList = new EventEmitter();
  @Output() resolve = new EventEmitter();

  commandsSubscription: Subscription;

  tasks: TaskC[];
  epics: Epic[] = [];
  stories: Story[] = [];
  problems: Problem[];
  actions: Action[];
  questions: Question[];
  knowledgeBits: Knowledge[];

  toggleNotesEditSubject: Subject<void> = new Subject<void>();
  @Input() refreshTasks$!: () => Observable<number[]>;

  constructor(private questionsService: QuestionsService,
              private taskContainerService: TaskContainerService,
              private toastr: ToastrService,
              private storiesService: StoriesService,
              private epicsService: EpicsService,
              private problemsService: ProblemsService,
              public dialog: MatDialog,
              private recordsService: RecordsService,
              public tasksService: TasksService,
              public commandsService: CommandsService,
              public router: Router,
              private _hotkeysService: HotkeysService,
              private store: Store,
              public knowledgeService: KnowledgeService) {
  }

  ngOnInit(): void {
    this._hotkeysService.add(new Hotkey('alt+r', (event: KeyboardEvent): boolean => {
      this.showRecords();
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('alt+shift+r', (event: KeyboardEvent): boolean => {
      this.addRecord();
      return false; // Prevent bubbling
    }));

    this.refreshTaskContainerParts();

    this.commandsSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleTaskCommand(state.command);
    })

    this.taskContainerService.refreshSubtasks$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.refreshTaskContainer.emit());

  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === '1') {
      console.log('1');
    }
  }

  private refreshTaskContainerParts() {
    this.refreshTasks();
    this.refreshProblems();
    this.refreshQuestions();
    this.refreshActions();
    this.refreshKnowledgeBits();
    if (this.showStories) {
      this.refreshSubstories();
    }
    if (this.showEpics) {
      this.refreshSubepics();
    }

  }

  private handleTaskCommand(command: string): void {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['back', 'b'].includes(arr[0])) {
      // this.goToNearestParent.emit();
      this.goToNearestParent();
    }
    if (['anonymous'].includes(arr[0])) {
      this.addAnonymousTaskHandler();
    }
    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.tasks.length) {
      this.router.navigate(['task', this.tasks[+arr[0] - 1]]).then();
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
    if (['question'].includes(arr[0])) {
      this.addQuestion();
    }
    if (['a', 'fta', 'fa', 'finish-all-tasks'].includes(arr[0])) {
      this.finishAllTasks();
    }
    if (['r', 'res', 'resolve'].includes(arr[0])) {
      this.resolve.emit();
    }
    if (['notes'].includes(arr[0])) {
      this.callEditNotesEvent();
    }
    if (['records'].includes(arr[0])) {
      this.showRecords();
    }
    if (['new-record'].includes(arr[0])) {
      this.addRecord();
    }
  }

  finishAllTasks() {
    this.tasksService.finishTasks(this.tasks).subscribe(() => this.refreshTasks());
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
      const tasksToFinish = rangeNumbers.map((index: number) => this.tasks[index]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks());
    } else if (args.length > 0 && args[0] && args[0].includes(',')) {
      const numbers = args[0].split(',').map(str => +str);
      const tasksToFinish = numbers.map((number: number) => this.tasks[number - 1]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks());
    } else {
      const index = +args[0];
      if (Number.isInteger(index) && index >= 1 && index <= this.tasks.length) {
        this.tasksService.finishTask(this.tasks[index - 1]).subscribe(() => this.refreshTasks());
      }
    }
  }

  private addAnonymousTaskHandler() {
    this.tasksService.addAnonymousTask().subscribe();
  }

  addQuestion(): void {
    this.questionsService.createNewQuestionFromDialog(this.taskContainer)
      .subscribe(() => this.refreshTaskContainer.emit());
  }

  addProblem(): void {
    this.problemsService.createProblemFromDialog(this.taskContainer)
      .subscribe(() => this.refreshTaskContainer.emit());
  }

  goToParentHandler(description: string): void {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  goToNearestParent(): void {
    if (!this.taskContainer.parents || this.taskContainer.parents.length === 0) {
      return;
    }
    const parent = this.taskContainer.parents[0];
    this.router.navigate([parent[0], parent[1]]).then();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskContainer) {
      this.refreshTaskContainerParts();
    }
  }

  refreshActions() {
    const actionsSubscription$ = this.knowledgeService.getActions(this.taskContainer.actions);
    actionsSubscription$.subscribe(actions => {
      this.actions = actions;
    });
    return actionsSubscription$;
  }

  refreshKnowledgeBits() {
    const knowledgeBitsSubscription$ =
      this.knowledgeService.getKnowledgeBits(this.taskContainer.knowledgeBits);
    knowledgeBitsSubscription$.subscribe(knowledgeBits => this.knowledgeBits = knowledgeBits);
    return knowledgeBitsSubscription$;
  }

  callEditNotesEvent() {
    this.toggleNotesEditSubject.next();
  }

  updateNotes(newNotesValue: string) {
    this.taskContainer.notes = newNotesValue;
    this.updateTaskContainer.emit();
  }

  refreshTasks() {
    // this.refreshTaskContainerTasksList.emit();
    this.refreshTasks$().subscribe(tasks => {
      this.taskContainer.tasks = tasks;
      this.tasksService.getTasks(tasks).subscribe(res => this.tasks = res);
    })
  }

  refreshSubstories():Observable<Story[]> {
    const stories$ = this.storiesService.getStories(this.taskContainer.stories);
    stories$.subscribe(stories => this.stories = stories);
    return stories$
  }

  refreshSubepics():Observable<Epic[]> {
    const epics$ = this.epicsService.getEpics(this.taskContainer.epics);
    epics$.subscribe(epics => this.epics = epics);
    return epics$;
  }

  refreshQuestions(): Observable<Question[]> {
    const questions$ = this.questionsService.getQuestions(this.taskContainer.questions);
    questions$
      .subscribe(questions => this.questions = questions.filter((p: Question) => !p.answer));
    return questions$;
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

  refreshProblems(): Observable<Problem[]> {
    const problems$ = this.problemsService.getProblems(this.taskContainer.problems);
    problems$
      .pipe(
        map((problems: Problem[]) => problems.filter(p => !p.solution)),
      )
      .subscribe((problems: Problem[]) => {
        this.problems = problems;
      });
    return problems$;
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.taskContainer);
  }

  ngOnDestroy(): void {
    this.commandsSubscription.unsubscribe();
  }

  @HostListener('document:keydown.code.Alt.r', ['$event'])
  showRecords(): void {
    // const records = getRootDirs
    // this.recordsService.getRecords(this.taskContainer.getFullDescription()).subscribe(
    //   (records: RecordItem[]) => { console.log('AAAAAA', records); }
    // )
    const dialogRef = this.dialog.open(RecordsListDialogComponent,
      {
        panelClass: 'custom-dialog-container',
        height: '600px',
        width: '1000px',
        data: {tag: this.taskContainer.getFullDescription()}});
    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog was closed RecordsListDialogComponent');
    });
  }

  // @HostListener('document:keydown', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   if ((event.ctrlKey) && event.key === 'o') {
  //     this.addSubtaskHandler();
  //   }
  // }

  private addSubtaskHandler() {
    console.log('task-container.component.ts -- addSubtaskHandler');
    const taskToAddSubtaskTo = this.store.selectSnapshot(AppState.getFocusedTaskForSubtasks);
    if (taskToAddSubtaskTo && !this.tasksService.addTaskDialogOpened) {
      this.tasksService.openAddTaskDialog2(taskToAddSubtaskTo).subscribe(() => {
        this.tasksService.addTaskDialogOpened = false;
        this.taskContainerService.refreshSubtasks$.next(taskToAddSubtaskTo);
      });
    }
  }

  addRecord() {
    this.recordsService.callAddRecordDialog(this.taskContainer.getFullDescription());
  }

  addSubstory() {
    // TODO fill it
  }

  navigateToStory(story: Story) {
    this.router.navigate(['story', story._id]).then();
  }

}
