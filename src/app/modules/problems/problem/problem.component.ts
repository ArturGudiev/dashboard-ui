import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {ProblemsService} from "../../../services/problems.service";
import {Problem} from "../../../models/problem";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {Observable, Subscription} from "rxjs";
import {TaskContainerService} from "../../../services/task-container.service";

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.sass']
})
export class ProblemComponent implements OnInit, OnDestroy {
  id: number;
  problem: Problem;

  parentsPath: string[];
  routerSubscription: Subscription;
  problemSubscription: Subscription;
  isLoading = true;
  parentsPath$: Observable<string[]>;

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
    this.routerSubscription = this.route.params.subscribe(params => {
      this.isLoading = true;
      let id = params['id'];
      this.problemsService.getProblem(id).subscribe((problem: Problem) => {
        this.problem = problem;
        this.isLoading = false;
        this.parentsPath$ = this.problemsService.getParentsPath(this.problem);
        this.titleService.setTitle(this.problem.getFullDescription());
        if (this.problem !== null) {
          this.taskContainerService.getParentsPath(this.problem).subscribe((res: string[]) => this.parentsPath = res);
        }
      });
    })

    // this.commandSubscription = this.commandsService.getDataStateChange().subscribe(state => {
    //   this.handleTaskCommand(state.command);
    // });

    this.problemSubscription = this.problemsService.getRefreshProblemsDataStateChange().subscribe(state => {
      if(state.lastSolvedProblem === this.problem) {
        this.onGoToNearestParent();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.problemSubscription.unsubscribe();
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
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(this.problem, solution).subscribe();
      }
      if (this.parentsPath && this.parentsPath.length > 1) {
        const description = this.parentsPath.slice(-2, -1)[0];
        this.goToParentHandler(description);
      }
    });
  }

}
