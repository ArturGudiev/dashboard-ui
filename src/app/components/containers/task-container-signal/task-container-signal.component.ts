import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Hotkey, HotkeysService } from "angular2-hotkeys";
import * as _ from "lodash";
import { Observable, of, Subject } from "rxjs";
import { Problem } from "../../../models/problem";
import { Question } from "../../../models/question";
import { Story } from "../../../models/story";
import { TaskC } from "../../../models/task-class";
import { CommandsService } from "../../../services/commands.service";
import { RecordsService } from "../../../services/records.service";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { Epic } from "../../../models/epic";
import { RecordsListDialogComponent } from "../../dialogs/records-list-dialog/records-list-dialog.component";
import { HelpComponent } from "../../pages/help/help.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { EpicsListComponent } from "../../lists/epics-list/epics-list.component";
import { SubStoriesComponent } from "../../lists/substories/sub-stories.component";
import { QuestionsListComponent } from "../../lists/questions-list/questions-list.component";
import { ProblemsListComponent } from "../../lists/problems-list/problems-list.component";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";

import { ParentsPathComponent } from "../parents-path/parents-path.component";
import { NotesComponent } from "../notes/notes.component";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { QuestionsService } from "../../../services/task-container-services/questions.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { StoriesService } from "../../../services/task-container-services/stories.service";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { UtilsService } from "../../../services/utils.service";
import { ContainerReportComponent } from "../container-report/container-report.component";
import { TasksListComponent } from "../../lists/tasks-list/tasks-list.component";

/** Stable fallback so `[tasks]="… ?? []"` does not allocate a new array every CD tick (breaks TasksListComponent's effect). */
const EMPTY_TASKS: TaskC[] = [];
const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_PROBLEMS: Problem[] = [];
const EMPTY_PARENTS_PATH: string[] = [];

@Component({
  selector: 'app-task-container-signal',
  templateUrl: './task-container-signal.component.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ParentsPathComponent,
    EpicsListComponent,
    SubStoriesComponent,
    QuestionsListComponent,
    ProblemsListComponent,
    NotesComponent,
    ContainerReportComponent,
    TasksListComponent,
  ],
  standalone: true,
  styleUrls: ['./task-container-signal.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskContainerSignalComponent implements OnInit {
  taskContainer = input.required<TaskContainer>();

  showEpics = input<boolean>(false);
  showStories = input<boolean>(false);
  showQuestions = input<boolean>(false);
  showProblems = input<boolean>(false);

  refreshContainer = output<void>();

  onDoneAllClick = output<void>();
  updateTaskContainer = output<void>();
  resolve = output<void>();

  readonly displayReport = signal(false);

  // tasks = signal<TaskC[]>([]);

  tasksResource = rxResource<TaskC[], { tasks: number[] }>({
    params: () => ({ tasks: this.taskContainer().tasks }),
    stream: ({ params }) => this.tasksService.getTasks(params.tasks),
  });

  parentsPathResource = rxResource<string[], { containerKey: string }>({
    params: () => {
      const c = this.taskContainer();
      return { containerKey: `${c.type}:${c.id}` };
    },
    stream: () => this.taskContainerService.getParentsPath(this.taskContainer()),
  });

  questionsResource = rxResource<Question[], { ids: number[] }>({
    params: () => ({ ids: this.taskContainer().questions ?? [] }),
    stream: ({ params }) =>
      params.ids.length ? this.questionsService.getQuestions(params.ids) : of([]),
  });

  problemsResource = rxResource<Problem[], { ids: number[] }>({
    params: () => ({ ids: this.taskContainer().problems ?? [] }),
    stream: ({ params }) =>
      params.ids.length ? this.problemsService.getProblems(params.ids) : of([]),
  });

  private lastTasks = signal<TaskC[]>([]);
  private lastQuestions = signal<Question[]>([]);
  private lastProblems = signal<Problem[]>([]);

  /** Keep previous rows while tasksResource reloads so the list does not unmount and blink. */
  readonly tasksForList = computed(() => {
    const live = this.tasksResource.value();
    if (live != null) {
      return live;
    }
    return this.lastTasks().length > 0 ? this.lastTasks() : EMPTY_TASKS;
  });

  readonly questionsForList = computed(() => {
    const live = this.questionsResource.value();
    if (live != null) {
      return live;
    }
    return this.lastQuestions().length > 0 ? this.lastQuestions() : EMPTY_QUESTIONS;
  });

  readonly problemsForList = computed(() => {
    const live = this.problemsResource.value();
    if (live != null) {
      return live;
    }
    return this.lastProblems().length > 0 ? this.lastProblems() : EMPTY_PROBLEMS;
  });

  private lastParentsPath = signal<string[]>([]);

  readonly viewParentsPath = computed(() => {
    const live = this.parentsPathResource.value() ?? [];
    return live.length > 0 ? live : (this.lastParentsPath().length > 0 ? this.lastParentsPath() : EMPTY_PARENTS_PATH);
  });

  epics = signal<Epic[]>([]);
  stories = signal<Story[]>([]);
  problems = signal<Problem[]>([]);
  questions = signal<Question[]>([]);

  toggleNotesEditSubject: Subject<void> = new Subject<void>();

  readonly toggleReportTitle = computed(() => this.displayReport() ? 'Hide report' : 'Show report');

  private questionsService = inject(QuestionsService);
  private taskContainerService = inject(TaskContainerService);
  private storiesService = inject(StoriesService);
  private epicsService = inject(EpicsService);
  private problemsService = inject(ProblemsService);
  private dialog = inject(MatDialog);
  private recordsService = inject(RecordsService);
  private tasksService = inject(TasksService);
  private commandsService = inject(CommandsService);
  private router = inject(Router);
  private _hotkeysService = inject(HotkeysService);
  private utilsService = inject(UtilsService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const container = this.taskContainer();
      if (!container) { return; }
      this.refreshTaskContainerParts();
    });

    effect(() => {
      const path = this.parentsPathResource.value();
      if (path != null) {
        this.lastParentsPath.set(path);
      }
    });

    effect(() => {
      const tasks = this.tasksResource.value();
      if (tasks != null) {
        this.lastTasks.set(tasks);
      }
    });

    effect(() => {
      const questions = this.questionsResource.value();
      if (questions != null) {
        this.lastQuestions.set(questions);
      }
    });

    effect(() => {
      const problems = this.problemsResource.value();
      if (problems != null) {
        this.lastProblems.set(problems);
      }
    });
  }

  ngOnInit(): void {
    this._hotkeysService.add(new Hotkey('alt+r', (): boolean => {
      this.showRecords();
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('alt+shift+r', (): boolean => {
      this.addRecord();
      return false;
    }));

    this.commandsService.getDataStateChange().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      this.handleTaskCommand(state.command);
    })

    this.taskContainerService.refreshSubtasks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshContainer.emit());

  }

  /** Reload container from parent so `taskContainer().tasks` IDs match the server (e.g. after add task). */
  refreshTasks(): void {
    this.refreshContainer.emit();
  }

  refreshQuestions(): void {
    this.refreshContainer.emit();
  }

  refreshProblems(): void {
    this.refreshContainer.emit();
  }

  private refreshTaskContainerParts() {
    const container = this.taskContainer();
    if (!container) {
      return;
    }

    if (this.showStories()) {
      this.refreshSubstories();
    }
    if (this.showEpics()) {
      this.refreshSubepics();
    }
  }

  private handleTaskCommand(command: string): void {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['help'].includes(arr[0])) {
      this.showHelp();
    }
    if (['anonymous'].includes(arr[0])) {
      this.addAnonymousTaskHandler();
    }
    if (['f', 'ft', 'finish-task'].includes(arr[0])) {
      this.finishTaskHandler(args);
    }
    if (['fp', 'finish-problem'].includes(arr[0])) {
      this.finishProblemHandler(args);
    }
    if (['a', 'fta', 'fa', 'finish-all-tasks'].includes(arr[0])) {
      this.finishAllTasks();
    }
    if (['r', 'res', 'resolve'].includes(arr[0])) {
      this.onDoneAllButtonClick();
    }
    if (['notes'].includes(arr[0])) {
      this.callEditNotesEvent();
    }
    if (['records'].includes(arr[0])) {
      this.showRecords();
    }
    if (['new-recorpd'].includes(arr[0])) {
      this.addRecord();
    }
    if (['parent'].includes(arr[0])) {
      this.goToNearestParent();
    }
    if (['add-to-parent', 'tparent', 'tp', 'pt', 'par+'].includes(arr[0])) {
      this.addTaskToParentInteractively();
    }
    if (['go-to-parent', 'go-parent', 'gop'].includes(arr[0])) {
      this.goToParentInteractively();
    }
    if (['log', 'l+'].includes(arr[0])) {
      this.taskContainerService.openAddLogDialog(this.taskContainer()).subscribe();
    }
    if (['ls', 'logs', 'l'].includes(arr[0])) {
      this.taskContainerService.openLogsDialog(this.taskContainer());
    }
  }

  finishAllTasks() {
    // this.tasksService.finishTasks(this.tasksResource.value() ?? []).subscribe(() => this.refreshContainer.emit());
  }

  private finishProblemHandler(args: string[]) {
    if (!args || args.length === 0) {
      return;
    }
    const index = +args[0];
    const problems = this.problemsForList();
    if (Number.isInteger(index) && index >= 1 && index <= problems.length) {
      const problem = problems[index - 1];
      this.solveTheProblem(problem);
    }
  }

  onDoneAllButtonClick(): void {
    const container = this.taskContainer();
    if (container.type === 'question') {
      const dialogRef = this.dialog.open(GetValueDialogComponent, {
        data: { title: 'Solution', inputWidth: '40rem' },
      });
      dialogRef.afterClosed().subscribe((answer: string) => {
        if (answer) {
          this.questionsService
            .answerTheQuestion(container as Question, answer)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.navigateToParentAfterResolve());
        }
      });
      return;
    }
    if (container.type === 'problem') {
      const dialogRef = this.dialog.open(GetValueDialogComponent, {
        data: { title: 'Solution', inputWidth: '40rem' },
      });
      dialogRef.afterClosed().subscribe((solution: string) => {
        if (solution) {
          this.problemsService
            .solveTheProblem(container as Problem, solution)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.navigateToParentAfterResolve());
        }
      });
      return;
    }
    this.onDoneAllClick.emit();
  }

  private navigateToParentAfterResolve(): void {
    const parentsPath = this.viewParentsPath();
    if (parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(parentsPath.slice(-2, -1)[0]);
  }

  private finishTaskHandler(args: string[]) {
    if (!args || args.length === 0) {
      return;
    }
    if (args.length > 0 && args[0] && /^\d+-\d+$/.test(args[0])) {
      const tasks = this.tasksResource.value() ?? [];
      const numbers = args[0].split('-');
      const num1 = +numbers[0] - 1;
      const num2 = +numbers[1] - 1;
      const rangeNumbers = _.range(num1, num2 + 1);
      const tasksToFinish = rangeNumbers.map((index: number) => tasks[index]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshContainer.emit());
    } else if (args.length > 0 && args[0] && args[0].includes(',')) {
      const tasks = this.tasksResource.value() ?? [];
      const numbers = args[0].split(',').map(str => +str);
      const tasksToFinish = numbers.map((number: number) => tasks[number - 1]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshContainer.emit());
    } else {
      const index = +args[0];
      const tasks = this.tasksResource.value() ?? [];
      if (Number.isInteger(index) && index >= 1 && index <= tasks.length) {
        this.tasksService.finishTask(tasks[index - 1]).subscribe(() => this.refreshContainer.emit());
      }
    }
  }

  private addAnonymousTaskHandler() {
    this.tasksService.addAnonymousTask().subscribe();
  }

  addQuestion(): void {
    this.questionsService.createQuestionFromDialog(this.taskContainer())
      .subscribe(() => this.refreshContainer.emit());
  }

  goToParentHandler(description: string): void {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  goToNearestParent(): void {
    const taskContainerVal = this.taskContainer();
    if (taskContainerVal.type === "epic" && taskContainerVal.parentContainers.length === 0) {
      this.router.navigate(['epics']).then();
    }
    if (!taskContainerVal.parentContainers || taskContainerVal.parentContainers.length === 0) {
      return;
    }
    const parent = taskContainerVal.parentContainers[0];
    this.router.navigate([parent.type, parent.id]).then();

  }

  callEditNotesEvent() {
    this.toggleNotesEditSubject.next();
  }

  updateNotes(newNotesValue: string) {
    this.taskContainer().notes = newNotesValue;
    this.updateTaskContainer.emit();
  }

  refreshSubstories():Observable<Story[]> {
    const taskContainerVal = this.taskContainer();
    
    if (!taskContainerVal.stories?.length) {
      return of([]);
    }
    const stories$ = this.storiesService.getStories(taskContainerVal.stories);
    stories$.subscribe(stories => this.stories.set(stories));
    return stories$;
  }

  refreshSubepics():Observable<Epic[]> {
    const taskContainerVal = this.taskContainer();
    if (!taskContainerVal.epics?.length) {
      return of([]);
    }
    const epics$ = this.epicsService.getEpics(taskContainerVal.epics);
    epics$.subscribe((epics: Epic[]) => this.epics.set(epics));
    return epics$;
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.taskContainer());
  }

  @HostListener('document:keydown.code.Alt.r')
  showRecords(): void {
    const dialogRef = this.dialog.open(RecordsListDialogComponent,
      {
        panelClass: 'custom-dialog-container',
        height: '600px',
        width: '1000px',
        data: {tag: this.taskContainer().getFullDescription()}});
    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog was closed RecordsListDialogComponent');
    });
  }


  addRecord() {
    this.recordsService.callAddRecordDialog(this.taskContainer().getFullDescription());
  }

  addSubstory() {
    // TODO fill it
  }

  navigateToStory(story: Story) {
    this.router.navigate(['story', story.id]).then();
  }

  private showHelp() {
    this.dialog.open(HelpComponent, { height: '600px', width: '1000px' });
  }

  private addTaskToParentInteractively() {
    this.utilsService.selectFromList(this.viewParentsPath().slice(0, -1)).subscribe((parent: string | undefined) => {
      if (parent) {
        this.taskContainerService.addTaskToContainerByShortDescription(parent);
      }
    });
  }

  private goToParentInteractively() {
    this.utilsService
      .selectIndexFromList(this.viewParentsPath().slice(0, -1))
      .subscribe((val: number | undefined) => {
        if (val !== undefined) {
          this.goToParentHandler(this.viewParentsPath()[val]);
        }
    });
  }


  /**
   *
   */
  toggleReport() {
    this.displayReport.update(value => !value);
  }
}
