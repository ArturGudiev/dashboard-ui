import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, HostListener, inject, input, type OnInit, output, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Hotkey, HotkeysService } from "angular2-hotkeys";
import * as _ from "lodash";
import { type Observable, map, of, Subject } from "rxjs";
import { type Problem } from "../../../models/problem";
import { type Question } from "../../../models/question";
import { type Story } from "../../../models/story";
import { type ContainerCheck, ContainerVariable, type TaskC } from "../../../models/task-class";
import { CommandsService } from "../../../services/commands.service";
import { RecordsService } from "../../../services/records.service";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { type Epic } from "../../../models/epic";
import { type KnowledgeNode } from "../../../models/knowledge-node";
import { RecordsListDialogComponent } from "../../dialogs/records-list-dialog/records-list-dialog.component";
import { HelpComponent } from "../../pages/help/help.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { EpicsListComponent } from "../../lists/epics-list/epics-list.component";
import { SubStoriesComponent } from "../../lists/substories/sub-stories.component";
import { QuestionsListComponent } from "../../lists/questions-list/questions-list.component";
import { ProblemsListComponent } from "../../lists/problems-list/problems-list.component";
import { KnowledgeNodesListComponent } from "../../lists/knowledge-nodes-list/knowledge-nodes-list.component";
import { DefinitionsListComponent } from "../../lists/definitions-list/definitions-list.component";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { VariableDialogComponent, type VariableDialogResult } from "../../dialogs/variable-dialog/variable-dialog.component";
import { AliasesDialogComponent } from "../../dialogs/aliases-dialog/aliases-dialog.component";
import { RunScriptDialogComponent, type RunScriptDialogResult } from "../../dialogs/run-script-dialog/run-script-dialog.component";
import {
  ScriptEditDialogComponent,
  type ScriptEditDialogResult,
} from "../../dialogs/script-edit-dialog/script-edit-dialog.component";
import { ContainerScriptsListComponent } from "../../lists/container-scripts-list/container-scripts-list.component";
import { ScriptsApiService } from '../../../services/scripts-api.service';
import { type ScriptListItem } from '../../../models/script';

import { ParentsPathComponent } from "../parents-path/parents-path.component";
import { NotesComponent } from "../notes/notes.component";
import { type TaskContainer } from "../../../models/interfaces/task-container";
import { QuestionsService } from "../../../services/task-container-services/questions.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { StoriesService } from "../../../services/task-container-services/stories.service";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { KnowledgeNodesService } from "../../../services/task-container-services/knowledge-nodes.service";
import { DefinitionsService } from "../../../services/task-container-services/definitions.service";
import { type Definition } from "../../../models/definition";
import { UtilsService } from "../../../services/utils.service";
import { ContainerReportComponent } from "../container-report/container-report.component";
import { TasksListComponent } from "../../lists/tasks-list/tasks-list.component";
import { VariablesTableComponent } from "../../lists/variables-table/variables-table.component";
import { ContainerChecksListComponent } from "../../lists/container-checks-list/container-checks-list.component";
import { ContainerFilesListComponent } from "../../lists/container-files-list/container-files-list.component";
import {
  ALIASES_DIALOG_OPTIONS,
  GET_VALUE_DIALOG_OPTIONS,
  RUN_SCRIPT_DIALOG_OPTIONS,
  SCRIPT_EDIT_DIALOG_OPTIONS,
  VARIABLE_DIALOG_OPTIONS,
  isTask,
} from '../../../shared/constants';
import { ContainerVariablesApiService } from '../../../services/container-variables-api.service';
import { ContainerChecksApiService } from '../../../services/container-checks-api.service';
import { AliasesService } from '../../../services/aliases.service';
import { AlertService } from '../../../services/alert.service';
import { AppStore } from "../../../state/app.store";
import { type ModelsAliasModel } from '../../../types/generated';

/** Stable fallback so `[tasks]="… ?? []"` does not allocate a new array every CD tick (breaks TasksListComponent's effect). */
const EMPTY_TASKS: TaskC[] = [];
const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_PROBLEMS: Problem[] = [];
const EMPTY_STORIES: Story[] = [];
const EMPTY_PARENTS_PATH: string[] = [];
const EMPTY_ALIASES: string[] = [];

const ALIAS_SUPPORTED_TYPES = new Set([
  'epic',
  'story',
  'task',
  'question',
  'problem',
  'knowledge-node',
  'knowledge-bit',
  'definition',
  'action',
  'repetitive-task',
  'state',
]);

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
    KnowledgeNodesListComponent,
    DefinitionsListComponent,
    NotesComponent,
    ContainerReportComponent,
    TasksListComponent,
    VariablesTableComponent,
    ContainerChecksListComponent,
    ContainerScriptsListComponent,
    ContainerFilesListComponent,
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
  showKnowledgeNodes = input<boolean>(false);
  showDefinitions = input<boolean>(false);

  refreshContainer = output<void>();

  directionAddSubmission = output<void>();
  directionAddLongTask = output<void>();
  directionAddSubDirection = output<void>();
  directionShowStats = output<void>();

  doneAllClick = output<void>();
  updateTaskContainer = output<void>();
  resolve = output<void>();

  readonly displayReport = signal(false);

  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

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

  readonly aliasesSupported = computed(() =>
    ALIAS_SUPPORTED_TYPES.has(this.taskContainer().type),
  );

  aliasesResource = rxResource<ModelsAliasModel[], { enabled: boolean; containerKey: string }>({
    params: () => {
      const c = this.taskContainer();
      return {
        enabled: ALIAS_SUPPORTED_TYPES.has(c.type),
        containerKey: `${c.type}:${c.id}`,
      };
    },
    stream: ({ params }) =>
      params.enabled
        ? this.aliasesService.getContainerAliases(this.taskContainer())
        : of([]),
  });

  /** Enabled for epic/story containers (or when `[showStories]="true"`). */
  private readonly showStoriesEnabled = computed(
    () =>
      this.showStories() ||
      this.taskContainer().type === 'epic' ||
      this.taskContainer().type === 'story' ||
      this.taskContainer().type === 'direction',
  );

  storiesResource = rxResource<Story[], { enabled: boolean; ids: number[] }>({
    params: () => ({
      enabled: this.showStoriesEnabled(),
      ids: this.taskContainer().stories ?? [],
    }),
    stream: ({ params }) =>
      params.enabled && params.ids.length
        ? this.storiesService.getStories(params.ids)
        : of([]),
  });

  private lastTasks = signal<TaskC[]>([]);
  private lastQuestions = signal<Question[]>([]);
  private lastProblems = signal<Problem[]>([]);
  private lastStories = signal<Story[]>([]);
  private lastAliases = signal<string[]>([]);

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

  readonly storiesForList = computed(() => {
    const live = this.storiesResource.value();
    if (live != null) {
      return live;
    }
    return this.lastStories().length > 0 ? this.lastStories() : EMPTY_STORIES;
  });

  private lastParentsPath = signal<string[]>([]);

  readonly viewParentsPath = computed(() => {
    const live = this.parentsPathResource.value() ?? [];
    return live.length > 0 ? live : (this.lastParentsPath().length > 0 ? this.lastParentsPath() : EMPTY_PARENTS_PATH);
  });

  readonly aliasesForDisplay = computed(() => {
    const live = this.aliasesResource.value();
    if (live != null) {
      return live.map((alias) => alias.alias);
    }
    return this.lastAliases().length > 0 ? this.lastAliases() : EMPTY_ALIASES;
  });

  epics = signal<Epic[]>([]);
  stories = signal<Story[]>([]);
  problems = signal<Problem[]>([]);
  questions = signal<Question[]>([]);
  knowledgeNodes = signal<KnowledgeNode[]>([]);
  definitions = signal<Definition[]>([]);

  toggleNotesEditSubject: Subject<void> = new Subject<void>();

  variables = computed<ContainerVariable[]>(() =>
    this.appStore.variablesStack() ?? this.taskContainer().variables
  )

  checks = computed<ContainerCheck[]>(() =>
    this.taskContainer().checks ?? []
  )

  isTaskContainer = computed(() => isTask(this.taskContainer()))

  private questionsService = inject(QuestionsService);
  private taskContainerService = inject(TaskContainerService);
  private storiesService = inject(StoriesService);
  private epicsService = inject(EpicsService);
  private problemsService = inject(ProblemsService);
  private knowledgeNodesService = inject(KnowledgeNodesService);
  private definitionsService = inject(DefinitionsService);
  private dialog = inject(MatDialog);
  private recordsService = inject(RecordsService);
  private tasksService = inject(TasksService);
  private commandsService = inject(CommandsService);
  private router = inject(Router);
  private _hotkeysService = inject(HotkeysService);
  private utilsService = inject(UtilsService);
  private destroyRef = inject(DestroyRef);
  private appStore = inject(AppStore);
  private containerVariablesApiService = inject(ContainerVariablesApiService);
  private containerChecksApiService = inject(ContainerChecksApiService);
  private scriptsApiService = inject(ScriptsApiService);
  private aliasesService = inject(AliasesService);
  private alertService = inject(AlertService);

  private readonly scriptsTick = signal(0);

  private readonly scriptsResource = rxResource({
    params: () => ({
      type: this.taskContainer().type,
      id: this.taskContainer().id,
      tick: this.scriptsTick(),
    }),
    stream: ({ params }) => this.scriptsApiService.list({
      scope: 'local',
      containerType: params.type,
      containerId: params.id,
    }),
  });

  localScripts = computed<ScriptListItem[]>(() => this.scriptsResource.value() ?? []);

  showSideOverlay = computed(() =>
    this.taskContainer().variables.length > 0
    || this.checks().length > 0
    || this.localScripts().length > 0
  );

  private lastContainerKey = '';

  constructor() {
    effect(() => {
      const container = this.taskContainer();
      const key = `${container.type}:${container.id}`;
      if (this.lastContainerKey !== key) {
        this.lastContainerKey = key;
        this.lastTasks.set([]);
        this.lastQuestions.set([]);
        this.lastProblems.set([]);
        this.lastParentsPath.set([]);
        this.lastAliases.set([]);
        this.stories.set([]);
        this.epics.set([]);
        this.knowledgeNodes.set([]);
        this.definitions.set([]);
      }
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

    effect(() => {
      const aliases = this.aliasesResource.value();
      if (aliases != null) {
        this.lastAliases.set(aliases.map((alias) => alias.alias));
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

  onTasksReordered(newOrder: number[]): void {
    console.log('new order', newOrder);
    this.taskContainerService.changeOrderOfTasks(this.taskContainer(), newOrder).subscribe(() => this.refreshContainer.emit()); // TODO: handle error
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
    if (this.showKnowledgeNodes() || this.taskContainer().type === 'knowledge-node') {
      this.refreshKnowledgeNodes();
    }
    const definitionIds = container.definitions ?? [];
    if (this.showDefinitions() || container.type === 'definition' || definitionIds.length > 0) {
      this.refreshDefinitions();
    }
  }

  private handleTaskCommand(command: string): void {
    if (this.appStore.disabledHotkeys()) {
      return;
    }
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['help'].includes(arr[0])) {
      this.showHelp();
    }
    if (['anonymous', 't++'].includes(arr[0])) {
      const count = args[0] !== undefined ? Number.parseInt(args[0], 10) : 1;
      this.addAnonymousTaskHandler(Number.isFinite(count) && count > 0 ? count : 1);
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
    if (['definition', 'd+', 'def+'].includes(arr[0])) {
      this.addDefinition();
    }
    if (['ls', 'logs', 'l'].includes(arr[0])) {
      this.taskContainerService.openLogsDialog(this.taskContainer());
    }
    if (['set-stack'].includes(arr[0])) {
      this.utilsService
        .selectIndexFromList(this.viewParentsPath().slice(0, -1))
        .subscribe((val: number | undefined) => {
          if (val) {
            this.selectVariablesStackHandler(this.viewParentsPath()[val]);

          }
        });

    }
  }

  selectVariablesStackHandler(containerDescription: string) {
    const firstWord = containerDescription.split(' ')[0];
    const firstWordParts = firstWord.split('-').map(el => el.toLowerCase());
    const id = Number(firstWordParts[1]);
    if (firstWordParts[0] === 'task') {
      this.tasksService.getTask(id).subscribe(task => {
        this.appStore.setVariablesStack(task.variables);
      })
    }
  }

  finishAllTasks() {
    const tasks = this.tasksResource.value() ?? [];
    if (tasks.length > 15) {
      const confirmed = confirm(`Are you sure you want to close all ${tasks.length} tasks?`);
      if (!confirmed) {
        return;
      }
    }
    this.tasksService.finishTasks(tasks)
      .subscribe(() => this.refreshContainer.emit());
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
    if (container.type === 'task') {
      this.tasksService
        .finishTask(container as TaskC)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.navigateToParentAfterResolve());
      return;
    }
    if (container.type === 'story') {
      if (!confirm('Do you really want to close this story?')) {
        return;
      }
      this.storiesService
        .closeStory(container.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.navigateToParentAfterResolve());
      return;
    }
    if (container.type === 'epic') {
      if (!confirm('Do you really want to close this epic?')) {
        return;
      }
      this.epicsService
        .closeEpic(container.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.navigateToParentAfterResolve());
      return;
    }
    this.doneAllClick.emit();
  }

  private navigateToParentAfterResolve(): void {
    const parentsPath = this.viewParentsPath();
    if (parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(parentsPath.slice(-2, -1)[0]);
  }

  renameTask(): void {
    const container = this.taskContainer();
    const dialogRef = this.dialog.open(GetValueDialogComponent, {
      data: {
        title: 'new name for the task',
        inputWidth: '40rem',
        initialValue: (container as TaskC).description,
        selectInitialValue: true,
      },
      ...GET_VALUE_DIALOG_OPTIONS,
    });


    dialogRef.afterClosed().subscribe((newTaskName: string) => {
      if (newTaskName) {
        this.taskContainerService
          .renameTaskContainer(this.taskContainer(), newTaskName)
          .subscribe(() => this.refreshContainer.emit());
      }
    });
  }

  openAliasesDialog(): void {
    const dialogRef = this.dialog.open(AliasesDialogComponent, {
      data: {
        aliases: this.aliasesForDisplay(),
        containerDescription: this.taskContainer().getFullDescription(),
      },
      ...ALIASES_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((aliases: string[] | null) => {
      if (!aliases) {
        return;
      }

      this.aliasesService.updateContainerAliases(this.taskContainer(), aliases).subscribe({
        next: (updated) => {
          this.lastAliases.set(updated.map((alias) => alias.alias));
          this.aliasesResource.reload();
        },
        error: (error: unknown) => {
          const message =
            error && typeof error === 'object' && 'error' in error
              && (error as { error?: { error?: string } }).error?.error
              ? (error as { error: { error: string } }).error.error
              : 'Failed to update aliases';
          this.alertService.showAlert(message, 3000, 'error');
        },
      });
    });
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

  private addAnonymousTaskHandler(count = 1) {
    this.tasksService.addAnonymousTask(count).subscribe();
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
      return;
    }
    if (taskContainerVal.type === "knowledge-node" && taskContainerVal.parentContainers.length === 0) {
      if (taskContainerVal.id !== 1) {
        this.router.navigate(['knowledge-node', 1]).then();
      }
      return;
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
      this.epics.set([]);
      return of([]);
    }
    const epics$ = this.epicsService.getEpics(taskContainerVal.epics);
    epics$.subscribe((epics: Epic[]) => this.epics.set(epics));
    return epics$;
  }

  refreshKnowledgeNodes(): Observable<KnowledgeNode[]> {
    const taskContainerVal = this.taskContainer();
    const ids = taskContainerVal.knowledgeNodes ?? [];
    if (!ids.length) {
      this.knowledgeNodes.set([]);
      return of([]);
    }
    const nodes$ = this.knowledgeNodesService.getKnowledgeNodes(ids);
    nodes$.subscribe((nodes) => this.knowledgeNodes.set(nodes));
    return nodes$;
  }

  navigateToKnowledgeNode(node: KnowledgeNode): void {
    void this.router.navigate(['knowledge-node', node.id]);
  }

  refreshDefinitions(): Observable<Definition[]> {
    const taskContainerVal = this.taskContainer();
    const ids = taskContainerVal.definitions ?? [];
    if (!ids.length) {
      this.definitions.set([]);
      return of([]);
    }
    const defs$ = this.definitionsService.getDefinitions(ids);
    defs$.subscribe((items) => this.definitions.set(items));
    return defs$;
  }

  navigateToDefinition(definition: Definition): void {
    void this.router.navigate(['definition', definition.id]);
  }

  addDefinition(): void {
    this.definitionsService
      .createDefinitionFromDialog(this.taskContainer())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.definitions.update((items) => [...items, created]);
          this.refreshContainer.emit();
        },
        error: (err) => {
          const message = err?.error?.error ?? err?.message ?? 'Failed to create definition';
          this.alertService.showAlert(message, 4000, 'error');
        },
      });
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem);
  }

  @HostListener('document:keydown.code.Alt.r')
  showRecords(): void {
    this.dialog.open(RecordsListDialogComponent, {
      panelClass: 'custom-dialog-container',
      height: '600px',
      width: '1000px',
      data: { tag: this.taskContainer().getFullDescription() },
    });
  }


  addRecord() {
    this.recordsService.callAddRecordDialog(this.taskContainer().getFullDescription());
  }

  addSubstory(): void {
    this.storiesService
      .createStoryFromDialog(this.taskContainer())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshContainer.emit());
  }

  addSubepic(): void {
    this.epicsService
      .createEpicFromDialog(this.taskContainer())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshContainer.emit());
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

  addVariable(): void {
    this.openVariableDialog();
  }

  addScript(): void {
    const dialogRef = this.dialog.open(ScriptEditDialogComponent, {
      data: { script: null },
      ...SCRIPT_EDIT_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: ScriptEditDialogResult | null) => {
      if (!result) {
        return;
      }
      const container = this.taskContainer();
      this.scriptsApiService.create({
        ...result,
        container: { id: container.id, type: container.type },
      }).subscribe({
        next: () => this.reloadLocalScripts(),
        error: (err) => this.alertService.showAlert(err?.error?.error ?? 'Failed to create script', 4000, 'error'),
      });
    });
  }

  runScript(scriptId?: number): void {
    const dialogRef = this.dialog.open(RunScriptDialogComponent, {
      data: {
        container: this.taskContainer(),
        scriptId,
        scope: 'all',
      },
      ...RUN_SCRIPT_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: RunScriptDialogResult | null) => {
      if (!result) {
        return;
      }
      this.scriptsApiService.run(result.scriptId, this.taskContainer(), result.params).subscribe({
        next: () => this.refreshContainer.emit(),
        error: (err) => {
          const message = err?.error?.error ?? 'Script failed';
          this.alertService.showAlert(typeof message === 'string' ? message : 'Script failed', 4000, 'error');
        },
      });
    });
  }

  reloadLocalScripts(): void {
    this.scriptsTick.update((n) => n + 1);
  }

  addCheck(): void {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {
      data: { title: 'New check' },
      ...GET_VALUE_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((description: string | null) => {
      if (!description?.trim()) {
        return;
      }

      this.containerChecksApiService.addCheck(
        this.taskContainer(),
        description.trim(),
      ).subscribe(() => this.refreshContainer.emit());
    });
  }

  private openVariableDialog(): void {
    const dialogRef = this.dialog.open(VariableDialogComponent, {
      data: {},
      ...VARIABLE_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: VariableDialogResult | null) => {
      if (!result) {
        return;
      }

      this.containerVariablesApiService.addVariable(
        this.taskContainer(),
        result.variableName,
        result.variableValue,
      ).subscribe(() => this.refreshContainer.emit());
    });
  }
}
