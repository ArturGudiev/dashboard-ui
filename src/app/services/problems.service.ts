import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {BehaviorSubject, Observable, of} from "rxjs";
import {Problem} from "../models/problem";
import {filter, switchMap, tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {GetValueDialogComponent} from "../modules/dialogs/get-value/get-value-dialog.component";
import {TaskContainer} from "../interfaces/task-container";
import {MatDialog} from "@angular/material/dialog";
import {TaskContainerDescription} from "../interfaces/types";

export interface RefreshProblemsState {
  taskContainer: TaskContainer;
  lastSolvedProblem: Problem;
}


@Injectable({
  providedIn: 'root'
})
export class ProblemsService {

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private dashboardService: DashboardService
  ) {
  }

  getProblems(ids: number[]): Observable<Problem[]> {
    return this.apiService._getProblems(ids);
  }

  finishProblem(problem: Problem): Observable<any> {
    throw Error('not implemented finish problem');
  }

  getProblem(id: any): Observable<Problem> {
    return this.apiService._getProblem(id);
  }

  solveTheProblem(problem: Problem, solution: string): Observable<any> {
    return this.apiService._solveTheProblem(problem._id, solution).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }

  createNewProblem(obj: any): Observable<Problem> {
    return this.apiService._createNewProblem(obj);
  }

  createProblemFromDialog(taskContainer: TaskContainer): Observable<Problem> {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Description'}});
    return dialogRef.afterClosed()
      .pipe(
        filter((description: string) => !!description),
        switchMap((description: string) => {
          const obj: any = {
            description: description,
            tags: [],
            parents: [taskContainer.getTaskContainerDescription()]
          };
          return this.createNewProblem(obj);
        })
      )
  }

  callSolveTheProblemDialog(problem: Problem, taskContainer: TaskContainer) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
    //     const state = this.getRefreshProblemsDataCurrentState();
    //     this.solveTheProblem(problem, solution)
    //       .subscribe(() => this.setRefreshProblemsDataState({
    //         ...state,
    //         taskContainer: taskContainer,
    //         lastSolvedProblem: problem}));
      }
    });

    }

  getParentsPath(problem: Problem): Observable<string[]> {
    return this.apiService._getProblemParentsPath(problem);
  }

  updateProblem(problem: Problem): Observable<Problem> {
    return this.apiService.updateProblem(problem);
  }
}
