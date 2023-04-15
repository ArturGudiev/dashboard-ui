import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StoriesService} from "../../../services/stories.service";
import {TasksService} from "../../../services/tasks.service";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {ProblemsService} from "../../../services/problems.service";
import {Problem} from "../../../models/problem";
import {TaskC} from "../../../models/task-class";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {CommandsService} from "../../../services/commands.service";
import * as _ from "lodash";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {Observable, Subscription} from "rxjs";
import {Question} from "../../../models/question";
import {QuestionsService} from "../../../services/questions.service";
import {KnowledgeDialogComponent} from "../../dialogs/knowledge-dialog/knowledge-dialog.component";
import {KnowledgeService} from "../../../services/knowledge.service";
import {Knowledge} from "../../../models/knowledge";
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
