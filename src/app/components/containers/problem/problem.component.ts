import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { Problem } from "../../../models/problem";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AsyncPipe } from "@angular/common";
import { map } from "rxjs/operators";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@UntilDestroy()
@Component({
    selector: 'app-problem',
    templateUrl: './problem.component.html',
    imports: [
    MatProgressSpinner,
    AsyncPipe,
    TaskContainerComponent
],
    styleUrls: ['./problem.component.sass']
})
export class ProblemComponent implements OnInit {
  id!: number;
  problem!: Problem;

  parentsPath: string[] = [];
  isLoading = true;

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
      this.titleService.setTitle(this.problem.getFullDescription());
      if (this.problem !== null) {
        this.taskContainerService.getParentsPath(this.problem).subscribe((res: string[]) => this.parentsPath = res);
      }
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
