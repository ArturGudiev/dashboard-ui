import { Component, OnInit } from '@angular/core';
import { Observable, of } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { Question } from "../../../models/question";
import { QuestionsService } from "../../../services/questions.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AsyncPipe, NgIf } from "@angular/common";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { map } from "rxjs/operators";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { TaskContainerService } from "../../../services/task-container.service";

@UntilDestroy()
@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  standalone: true,
  imports: [
    MatProgressSpinner,
    NgIf,
    AsyncPipe,
    TaskContainerComponent
  ],
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {
  id!: number;
  question!: Question; // TODO resolvers
  parentsPath: string[] = [];
  parentsPath$: Observable<string[]> = of([]);
  isLoading = true;

  refreshSubtasks$ = () => this.questionsService.getQuestion(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.questionsService.getQuestion(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.questionsService.getQuestion(this.id).pipe(map(e => e.questions));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
    private questionsService: QuestionsService,
    private taskContainerService: TaskContainerService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
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
      this.parentsPath$ = this.taskContainerService.getParentsPath(this.question);
      this.parentsPath$.subscribe((res: string[]) => this.parentsPath = res);
    });
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
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Solution', inputWidth: '40rem'}});
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
