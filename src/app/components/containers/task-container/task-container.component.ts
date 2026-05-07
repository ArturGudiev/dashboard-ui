import { Component, HostListener, inject, input, Input, OnChanges, OnInit, output, Output, signal, SimpleChanges } from '@angular/core';
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
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Epic } from "../../../models/epic";
import { RecordsListDialogComponent } from "../../dialogs/records-list-dialog/records-list-dialog.component";
import { HelpComponent } from "../../pages/help/help.component";
import { MaterialModule } from "../../../modules/material/material.module";
import { EpicsListComponent } from "../../lists/epics-list/epics-list.component";
import { SubStoriesComponent } from "../../lists/substories/sub-stories.component";
import { QuestionsListComponent } from "../../lists/questions-list/questions-list.component";
import { ProblemsListComponent } from "../../lists/problems-list/problems-list.component";

import { TasksListComponent } from "../../lists/tasks-list/tasks-list.component";
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

@UntilDestroy()
@Component({
  selector: 'app-task-container',
  templateUrl: './task-container.component.html',
  imports: [
    MaterialModule,
    ParentsPathComponent,
    EpicsListComponent,
    SubStoriesComponent,
    QuestionsListComponent,
    ProblemsListComponent,
    NotesComponent,
    TasksListComponent,
    ContainerReportComponent
  ],
  standalone: true,
  styleUrls: ['./task-container.component.sass']
})
export class TaskContainerComponent implements OnInit, OnChanges {
  taskContainer = input.required<TaskContainer>();
  
  parentsPath = input.required<string[]>();
  showEpics = input<boolean>(false);
  showStories = input<boolean>(false);

  @Input({required: true}) refreshTasks$!: () => Observable<number[]>;
  @Input({required: true}) refreshProblems$!: () => Observable<number[]>;
  @Input({required: true}) refreshQuestions$!: () => Observable<number[]>;

  onDoneAllClick = output<void>();
  updateTaskContainer = output<void>();
  refreshTaskContainer = output<void>();
  resolve = output<void>();

  displayReport = false;

  tasks = signal<TaskC[]>([]);
  epics = signal<Epic[]>([]);
  stories = signal<Story[]>([]);
  problems = signal<Problem[]>([]);
  questions = signal<Question[]>([]);

  toggleNotesEditSubject: Subject<void> = new Subject<void>();

  get toggleReportTitle(): string {
    return this.displayReport ? 'Hide report' : 'Show report';
  }

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

  ngOnInit(): void {
    this._hotkeysService.add(new Hotkey('alt+r', (): boolean => {
      this.showRecords();
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('alt+shift+r', (): boolean => {
      this.addRecord();
      return false; // Prevent bubbling
    }));

    this.refreshTaskContainerParts();

    this.commandsService.getDataStateChange().pipe(untilDestroyed(this)).subscribe(state => {
      this.handleTaskCommand(state.command);
    })

    this.taskContainerService.refreshSubtasks$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.refreshTaskContainer.emit());

  }

  private refreshTaskContainerParts() {
    this.refreshTasks();
    this.refreshProblems();
    this.refreshQuestions();
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
    this.tasksService.finishTasks(this.tasks()).subscribe(() => this.refreshTasks());
  }

  private finishProblemHandler(args: string[]) {
    if (!args || args.length === 0) {
      return;
    }
    const index = +args[0];
    if (Number.isInteger(index) && index >= 1 && index <= this.problems().length) {
      const problem = this.problems()[index - 1];
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
      const tasksToFinish = rangeNumbers.map((index: number) => this.tasks()[index]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks());
    } else if (args.length > 0 && args[0] && args[0].includes(',')) {
      const numbers = args[0].split(',').map(str => +str);
      const tasksToFinish = numbers.map((number: number) => this.tasks()[number - 1]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks());
    } else {
      const index = +args[0];
      if (Number.isInteger(index) && index >= 1 && index <= this.tasks().length) {
        this.tasksService.finishTask(this.tasks()[index - 1]).subscribe(() => this.refreshTasks());
      }
    }
  }

  private addAnonymousTaskHandler() {
    this.tasksService.addAnonymousTask().subscribe();
  }

  addQuestion(): void {
    this.questionsService.createQuestionFromDialog(this.taskContainer())
      .subscribe(() => this.refreshTaskContainer.emit());
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskContainer']) {
      this.refreshTaskContainerParts();
    }
  }

  callEditNotesEvent() {
    this.toggleNotesEditSubject.next();
  }

  updateNotes(newNotesValue: string) {
    this.taskContainer().notes = newNotesValue;
    this.updateTaskContainer.emit();
  }

  refreshTasks() {
    this.refreshTasks$().subscribe(tasks => {
      this.taskContainer().tasks = tasks;
      this.tasksService.getTasks(tasks).subscribe(res => this.tasks.set(res));
    })
  }

  refreshProblems() {
    this.refreshProblems$().subscribe(problems => {
      this.taskContainer().problems = problems;
      this.problemsService.getProblems(problems).subscribe(res => this.problems.set(res));
    })

  }

  refreshQuestions() {
    this.refreshQuestions$().subscribe(questions => {
      this.taskContainer().questions = questions;
      this.questionsService.getQuestions(questions).subscribe(res => this.questions.set(res));
    })

  }

  refreshSubstories():Observable<Story[]> {
    const taskContainerVal = this.taskContainer();
    if ( taskContainerVal.stories ) {
      const stories$ = this.storiesService.getStories(taskContainerVal.stories);
      stories$.subscribe(stories => this.stories.set(stories));
      return stories$
    }
    return of([]);
  }

  refreshSubepics():Observable<Epic[]> {
    const taskContainerVal = this.taskContainer();
    if (!taskContainerVal.epics) {
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
    this.utilsService.selectFromList(this.parentsPath().slice(0, -1)).subscribe((parent: string | undefined) => {
      if (parent) {
        this.taskContainerService.addTaskToContainerByShortDescription(parent);
      }
    });
  }

  private goToParentInteractively() {
    this.utilsService
      .selectIndexFromList(this.parentsPath().slice(0, -1))
      .subscribe((val: number | undefined) => {
        if (val !== undefined) {
          this.goToParentHandler(this.parentsPath()[val]);
        }
    });
  }


  /**
   *
   */
  toggleReport() {
    this.displayReport = !this.displayReport;
  }
}
