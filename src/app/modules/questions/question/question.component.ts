import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {CommandsService} from "../../../services/commands.service";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Question} from "../../../models/question";
import {QuestionsService} from "../../../services/questions.service";
import {TaskContainerService} from "../../../services/task-container.service";

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {
  question: Question;
  parentsPath: string[];
  isLoading = true;
  commandSubscription: Subscription;
  routerSubscription: Subscription;


  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
    private questionsService: QuestionsService,
    private taskContainerService: TaskContainerService,
    private commandsService: CommandsService
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];

      this.questionsService.getQuestion(id).subscribe((question: Question) => {
        this.question = question;
        this.isLoading = false;
        this.titleService.setTitle(this.question.getFullDescription());
        if (this.question !== null) {
          this.taskContainerService.getParentsPath(this.question)
            .subscribe((res: string[]) => this.parentsPath = res);

        }
      });
    })
    // this.commandSubscription = this.commandsService.getDataStateChange().subscribe(state => {
    //   this.handleTaskCommand(state.command);
    // });
  }

  ngOnDestroy(): void {
    // this.commandSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  answerTheQuestion(question: Question = this.question) {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Answer'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.questionsService.answerTheQuestion(question, solution).subscribe();
        if (question === this.question) {
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
    if (['r', 'resolve'].includes(arr[0])) {
      this.answerTheQuestion();
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

  onDoneAllClick() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.questionsService.answerTheQuestion(this.question, solution).subscribe();
      }
      if (this.parentsPath && this.parentsPath.length > 1) {
        const description = this.parentsPath.slice(-2, -1)[0];
        this.goToParentHandler(description);
      }
    });
  }

}
