import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {TaskC} from "../../../models/task-class";
import {Story} from "../../../models/story";
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {MatDialog} from "@angular/material/dialog";
import {StoriesService} from "../../../services/stories.service";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Title} from "@angular/platform-browser";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {ProblemsService} from "../../../services/problems.service";
import {Problem} from "../../../models/problem";
import {Observable, Subscription} from "rxjs";
import {CommandsService} from "../../../services/commands.service";
import {Question} from "../../../models/question";
import {QuestionsService} from "../../../services/questions.service";

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit, OnDestroy {
  story: Story;
  subtasks: TaskC[];
  problems: Problem[];
  questions: Question[];
  parentsPath: string[];
  substories: Story[];

  commandSubscription: Subscription;
  routerSubscription: Subscription;
  refreshQuestionsSubscription: Subscription;
  refreshTasksSubscription: Subscription;
  refreshProblemsSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
    private commandService: CommandsService,
    public problemsService: ProblemsService,
    private questionsService: QuestionsService
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.storiesService.getStory(id).subscribe((story: Story) => {
        this.story = story;
        this.titleService.setTitle(this.story.getFullDescription());
        if (this.story !== null) {
          this.tasksService.getParentsPath(this.story).subscribe((res: string[]) => {
            this.parentsPath = res;
          });
          this.refreshSubtasks();
          this.refreshProblems();
          this.refreshQuestions();
          this.refreshSubstories();
        }
      });
    });
    this.commandSubscription = this.commandService.getDataStateChange().subscribe(state => {
      this.handleCommand(state.command);
    });
    this.refreshQuestionsSubscription = this.questionsService.getRefreshQuestionsDataStateChange().subscribe(state => {
      if (this.story === state.taskContainer) { this.refreshQuestions(); }
    });
    this.refreshTasksSubscription = this.tasksService.getRefreshTasksDataStateChange().subscribe(state => {
      if (this.story === state.taskContainer) { this.refreshSubtasks(); }
    });
    this.refreshProblemsSubscription = this.problemsService.getRefreshProblemsDataStateChange().subscribe(state => {
      if (this.story === state.taskContainer) { this.refreshProblems(); }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.commandSubscription.unsubscribe();
    this.refreshQuestionsSubscription.unsubscribe();
    this.refreshTasksSubscription.unsubscribe();
    this.refreshProblemsSubscription.unsubscribe();
  }
  //--------------------------------questions start---------------------------------------------------------

  refreshQuestions(): Observable<Question[]> {
    const questions$ = this.questionsService.getQuestions(this.story.getFullDescription());
    questions$
      .subscribe((questions: Question[]) => this.questions = questions.filter((q: Question) => !q.answer));
    return questions$;
  }

  addQuestion() {
    this.questionsService.openAddQuestionDialog(this.story);
  }

  answerTheQuestion(question: Question) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Answer'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.questionsService.answerTheQuestion(question, solution).subscribe(() => this.refreshQuestions());
      }
    });
  }

  //---------------------------------questions end----------------------------------------------------------

  private handleCommand(command: string) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['back', 'b'].includes(arr[0])) {
      this.onGoToNearestParent();
      return;
    }
    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.subtasks.length) {
      this.router.navigate(['task', this.subtasks[+arr[0] - 1]._id]).then();
      return;
    }
    if (['f', 'ft', 'finish-task'].includes(arr[0])) {
      // this.finishTaskHandler(args);
      return;
    }
    if (['problem'].includes(arr[0])) {
      this.addProblem();
      return;
    }
    if (['fp', 'finish-problem'].includes(arr[0])) {
      this.finishProblemHandler(args);
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

  private refreshSubstories() {
    this.storiesService.getStories(this.story.getFullDescription()).subscribe(stories => {
      this.substories = stories;
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {

    if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
      this.openAddTaskDialog();
    }

  }

  navigateToStory(story: Story) {
    this.router.navigate(['story', story._id]).then();
  }


  refreshSubtasks() {
    this.tasksService.getTasks(this.story.getFullDescription()).subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
  }

  addSubtask() {
    this.tasksService.openAddTaskDialog(this.story);
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {parentTask: this.story},
        ...NewTaskDialogComponent.DIALOG_OPTIONS
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const description = result.description;
        const obj = {description: description, tags: [this.story.getFullDescription()]}
        this.tasksService.createNewTask(obj).subscribe(() => {
          this.refreshSubtasks();
        });
      }
    });
  }


  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
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

  refreshProblems(): void {
    this.problemsService.getProblems(this.story.getFullDescription())
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
  }

  addProblem(): void {
    this.problemsService.openAddProblemDialog(this.story);
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.story);
  }

}
