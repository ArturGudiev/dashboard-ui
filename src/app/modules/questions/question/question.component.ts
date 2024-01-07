import {Component, OnInit} from '@angular/core';
import {Observable, Subscription} from "rxjs";
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
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {
  question: Question;
  parentsPath: string[];
  parentsPath$: Observable<string[]>;
  isLoading = true;
  commandSubscription: Subscription;
  routerSubscription: Subscription;
  id: number;



  constructor(
    private route: ActivatedRoute,
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
      this.isLoading = true;
      this.id = params['id'];
      this.refreshQuestion();
    })
  }

  refreshQuestion(): void {
    this.questionsService.getQuestion(this.id)
    .subscribe((question: Question) => {
      this.question = question;
      this.isLoading = false;
      this.titleService.setTitle(this.question.getFullDescription());
      this.parentsPath$ = this.questionsService.getQuestionParentsPath(this.question);
      this.parentsPath$.subscribe((res: string[]) => this.parentsPath = res);
    });
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
    dialogRef.afterClosed().subscribe((answer: string) => {
      console.log('after closed dialog', answer);
      if (answer) {
        this.questionsService.answerTheQuestion(this.question, answer).subscribe();
        this.onGoToNearestParent();
      }
    });
  }

  updateQuestion() {
    this.questionsService.updateQuestion(this.question)
      .subscribe((question: Question) => {
        this.question = question;
      });
  }

}
