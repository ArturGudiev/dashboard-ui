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
import { Definition } from "../../../models/definition";
import { Problem } from "../../../models/problem";
import { Question } from "../../../models/question";
import { Story } from "../../../models/story";
import { TaskC } from "../../../models/task-class";
import { ActionDialogComponent } from "../../../modules/dialogs/action-dialog/action-dialog.component";
import { DefinitionDialogComponent } from "../../../modules/dialogs/definition/definition-dialog.component";
import { GetValueDialogComponent } from "../../../modules/dialogs/get-value/get-value-dialog.component";
import { KnowledgeDialogComponent } from "../../../modules/dialogs/knowledge-dialog/knowledge-dialog.component";
import { RecordsListDialogComponent } from "../../../modules/dialogs/records-list-dialog/records-list-dialog.component";
import { AlertService } from "../../../services/alert.service";
import { CommandsService } from "../../../services/commands.service";
import { KnowledgeService } from "../../../services/knowledge.service";
import { ProblemsService } from "../../../services/problems.service";
import { QuestionsService } from "../../../services/questions.service";
import { RecordsService } from "../../../services/records.service";
import { StoriesService } from "../../../services/stories.service";
import { TasksService } from "../../../services/tasks.service";
import { getUrlByDescription } from "../../libs/dashboard.lib";

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
  // @Output() goToNearestParent = new EventEmitter<string>();
  @Output() updateTaskContainer = new EventEmitter();
  @Output() refreshTaskContainer = new EventEmitter();
  @Output() resolve = new EventEmitter();

  refreshQuestionsSubscription: Subscription;
  refreshTasksSubscription: Subscription;
  refreshProblemsSubscription: Subscription;
  commandsSubscription: Subscription;

  subtasks: TaskC[];
  epics: Epic[] = [];
  stories: Story[] = [];
  problems: Problem[];
  actions: Action[];
  questions: Question[];
  definitions: Definition[];
  knowledgeBits: Knowledge[];
  // parentsPath: string[];

  toggleNotesEditSubject: Subject<void> = new Subject<void>();
  routerSubscription: Subscription;

  constructor(private questionsService: QuestionsService,
              private storiesService: StoriesService,
              private epicsService: EpicsService,
              private problemsService: ProblemsService,
              public dialog: MatDialog,
              private recordsService: RecordsService,
              public tasksService: TasksService,
              public commandsService: CommandsService,
              public router: Router,
              private _hotkeysService: HotkeysService,
              public alertService: AlertService,
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

    // const parentsPath$ = this.tasksService.getParentsPath(this.taskContainer);
    // parentsPath$.subscribe((res: string[]) => this.parentsPath = res);
    this.refreshTaskContainerParts();

    this.refreshQuestionsSubscription = this.questionsService.getRefreshQuestionsDataStateChange().subscribe(state => {
      if (this.taskContainer === state.taskContainer) { this.refreshQuestions(); }
    });
    this.refreshTasksSubscription = this.tasksService.getRefreshTasksDataStateChange().subscribe(state => {
      if (this.taskContainer === state.taskContainer) { this.refreshSubtasks(); }
    });
    this.refreshProblemsSubscription = this.problemsService.getRefreshProblemsDataStateChange().subscribe(state => {
      if (this.taskContainer === state.taskContainer) { this.refreshProblems(); }
    });
    this.commandsSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleTaskCommand(state.command);
    })
  }


  private refreshTaskContainerParts() {
    this.refreshSubtasks();
    this.refreshProblems();
    this.refreshQuestions();
    this.refreshDefinitions();
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
      this.resolve.emit();
    }
    if (['notes'].includes(arr[0])) {
      this.callEditNotesEvent();
    }
    if (['task'].includes(arr[0])) {
      this.addSubtask();
    }
    if (['records'].includes(arr[0])) {
      this.showRecords();
    }
    if (['new-record'].includes(arr[0])) {
      this.addRecord();
    }
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

  refreshDefinitions(): Observable<Definition[]> {
    const definitions$ = this.knowledgeService.getDefinitions(this.taskContainer.definitions);
    definitions$.subscribe(definitions => {
      return this.definitions = definitions;
    });
    return definitions$;
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


  addDefinition(): void {
    // this.knowledgeService.addDefinition();
    const dialogRef = this.dialog.open(DefinitionDialogComponent, {
      height: '400px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const definitionObject =
          {name: obj.name, value: obj.value, tags: [this.taskContainer.getFullDescription()],
              parents: [this.taskContainer.getTaskContainerDescription()]
          }
        this.knowledgeService.createNewDefinition(definitionObject).subscribe(() => this.refreshDefinitions());
      }
    });
  }

  refreshActions() {
    const actionsSubscription$ = this.knowledgeService.getActions(this.taskContainer.actions);
    actionsSubscription$.subscribe(actions => {
      this.actions = actions;
    });
    return actionsSubscription$;
  }


  addAction(): void {
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      height: '600px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const action = {
          name: obj.name,
          value: obj.value,
          tags: [this.taskContainer.getFullDescription()],
          extension: obj.extension
        };
        this.knowledgeService.createNewAction(action).subscribe(() => this.refreshActions());
      }
    });
  }

  refreshKnowledgeBits() {
    const knowledgeBitsSubscription$ =
      this.knowledgeService.getKnowledgeBits(this.taskContainer.knowledgeBits);
    knowledgeBitsSubscription$.subscribe(knowledgeBits => this.knowledgeBits = knowledgeBits);
    return knowledgeBitsSubscription$;
  }

  addKnowledge(): void {
    const dialogRef = this.dialog.open(KnowledgeDialogComponent, {
      height: '600px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const knowledge = {
          name: obj.name,
          value: obj.value,
          tags: [this.taskContainer.getFullDescription()],
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
    this.taskContainer.notes = newNotesValue;
    this.updateTaskContainer.emit();
  }

  refreshSubtasks() {
    const tasksObservable = this.tasksService.getTasks(this.taskContainer.tasks);
    tasksObservable.subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
    return tasksObservable;
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

  addSubtask() {
    this.tasksService.openAddTaskDialog(this.taskContainer)
      .subscribe((responseObj: any) => {
        this.tasksService.addTaskDialogOpened = false;
        if (!responseObj) {
          return;
        }
        const description = responseObj.description;
        if (description) {
          const obj: any = {
            description: description,
            tags: [],
            done: false,
            notes: responseObj.notes,
            parents: [this.taskContainer.getTaskContainerDescription()]
          }
          this.tasksService.createNewTask(obj)
            .subscribe(() => this.refreshTaskContainer.emit())
        }
      });
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
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

  // openAddProblemDialog(taskContainer: TaskContainer) {
  //   const dialogRef = this.dialog.open(GetValueDialogComponent,
  //     {data: {title: 'Description'}});
  //   dialogRef.afterClosed().subscribe((description: string) => {
  //     if (description) {
  //       const obj: any = {
  //         description: description, 
  //         tags: [],
  //         parents: [taskContainer.getTaskContainerDescription()]
  //       }
  //       this.problemsService.createNewProblem(obj)
  //       .subscribe( () => this.refreshTaskContainer.emit());
  //     }
  //   });
  // }

  refreshProblems(): Observable<Problem[]> {
    console.log('refreshProblems', this.taskContainer.problems);
    const problems$ = this.problemsService.getProblems(this.taskContainer.problems);
    problems$
      .pipe(
        map((problems: Problem[]) => problems.filter(p => !p.solution)),
        tap(val => console.log('tap', val))
      )
      .subscribe((problems: Problem[]) => {
        console.log('problems in subscribe', problems);
        this.problems = problems;
      });
    return problems$;
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.taskContainer);
  }

  ngOnDestroy(): void {
    this.refreshQuestionsSubscription.unsubscribe();
    this.refreshTasksSubscription.unsubscribe();
    this.refreshProblemsSubscription.unsubscribe();
    this.commandsSubscription.unsubscribe();
  }
  // @HostListener('document:keydown.code.meta.keyk', ['$event'])
  // openDialog(e: KeyboardEvent) {
  //   e.preventDefault();
  // }
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

  addRecord() {
    this.recordsService.callAddRecordDialog(this.taskContainer.getFullDescription());

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskContainer) {
      this.refreshTaskContainerParts();
    }
  }

  addSubstory() {
    // TODO fill it
  }

  navigateToStory(story: Story) {
    this.router.navigate(['story', story._id]).then();
  }

}
