import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { ProblemsService } from "../../../services/problems.service";
import { Problem } from "../../../models/problem";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { Observable, of } from "rxjs";
import { TaskContainerService } from "../../../services/task-container.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { GetValueDialogComponent } from "../../../modules/dialogs/get-value/get-value-dialog.component";
import { SharedModule } from "../../../shared/shared.module";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AsyncPipe, NgIf } from "@angular/common";
import { TasksService } from "../../../services/tasks.service";
import { map } from "rxjs/operators";
import { QuestionsService } from "../../../services/questions.service";

@UntilDestroy()
@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  standalone: true,
  imports: [
    SharedModule,
    MatProgressSpinner,
    AsyncPipe,
    NgIf
  ],
  styleUrls: ['./problem.component.sass']
})
export class ProblemComponent implements OnInit {
  id!: number;
  problem!: Problem;

  parentsPath: string[] = [];
  isLoading = true;
  parentsPath$: Observable<string[]> = of([]);

  refreshSubtasks$ = () => this.problemsService.getProblem(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.problemsService.getProblem(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.problemsService.getProblem(this.id).pipe(map(e => e.questions));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
    private problemsService: ProblemsService,
    private taskContainerService: TaskContainerService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
      this.isLoading = true;
      this.id = params['id'];
      this.refreshProblem();
    })
  }

  refreshProblem(): void {
    this.problemsService.getProblem(this.id)
    .subscribe((problem: Problem) => {
      this.problem = problem;
      this.isLoading = false;
      this.parentsPath$ = this.problemsService.getParentsPath(this.problem);
      this.titleService.setTitle(this.problem.getFullDescription());
      if (this.problem !== null) {
        this.taskContainerService.getParentsPath(this.problem).subscribe((res: string[]) => this.parentsPath = res);
      }
    });
  }

  solveTheProblem(problem: Problem = this.problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.problem);
  }

  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    const args = arr.slice(1);

    if (['r', 'resolve'].includes(arr[0])) {
      this.solveTheProblem();
      return;
    }
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
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(this.problem, solution).subscribe();
        this.onGoToNearestParent();
      }
    });
  }

  updateProblem() {
    this.problemsService.updateProblem(this.problem)
      .pipe(untilDestroyed(this))
      .subscribe((problem: Problem) => this.problem = problem);
  }

}
