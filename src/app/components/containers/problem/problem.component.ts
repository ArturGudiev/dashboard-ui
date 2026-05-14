import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { Problem } from "../../../models/problem";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { map } from "rxjs/operators";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  imports: [
    MatProgressSpinner,
    TaskContainerComponent
  ],
  standalone: true,
  styleUrls: ['./problem.component.sass']
})
export class ProblemComponent implements OnInit {
  id!: number;
  problem!: Problem;

  parentsPath = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  refreshSubtasks$ = () => this.problemsService.getProblem(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.problemsService.getProblem(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.problemsService.getProblem(this.id).pipe(map(e => e.questions));

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private dialog = inject(MatDialog);
  private problemsService = inject(ProblemsService);
  private taskContainerService = inject(TaskContainerService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.isLoading.set(true);
      this.id = params['id'];
      this.refreshProblem();
    })
  }

  refreshProblem(): void {
    this.problemsService.getProblem(this.id)
      .subscribe((problem: Problem) => {
        this.problem = problem;
        this.isLoading.set(false);
        this.titleService.setTitle(this.problem.getFullDescription());
        if (this.problem !== null) {
          this.taskContainerService.getParentsPath(this.problem).subscribe((res: string[]) => this.parentsPath.set(res));
        }
      });
  }

  onGoToNearestParent() {
    if (this.parentsPath() && this.parentsPath().length <= 1) { return; }
    this.goToParentHandler(this.parentsPath().slice(-2, -1)[0]);
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }


  onDoneAllClick() {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      { data: {title: 'Solution', inputWidth: '40rem'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(this.problem, solution).subscribe(() => {
          this.onGoToNearestParent();
        });
      }
    });
  }

  updateProblem() {
    this.problemsService.updateProblem(this.problem)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((problem: Problem) => this.problem = problem);
  }

}
