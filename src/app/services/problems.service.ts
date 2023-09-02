import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {BehaviorSubject, Observable} from "rxjs";
import {Problem} from "../models/problem";
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {GetValueDialogComponent} from "../modules/dialogs/get-value/get-value-dialog.component";
import {TaskContainer} from "../interfaces/task-container";
import {MatDialog} from "@angular/material/dialog";

export interface RefreshProblemsState {
  taskContainer: TaskContainer;
  lastSolvedProblem: Problem;
}


@Injectable({
  providedIn: 'root'
})
export class ProblemsService {
  private initialRefreshProblemsState: RefreshProblemsState = {
    taskContainer: null,
    lastSolvedProblem: null
  }
  private refreshProblemsState = new BehaviorSubject<RefreshProblemsState>(this.initialRefreshProblemsState);

  constructor(private apiService: ApiService,
              private dialog: MatDialog,
              private dashboardService: DashboardService
  ) {
  }

  getRefreshProblemsDataCurrentState(): RefreshProblemsState {
    return this.refreshProblemsState.getValue();
  }

  getRefreshProblemsDataStateChange(): Observable<RefreshProblemsState> {
    return this.refreshProblemsState.asObservable();
  }

  setRefreshProblemsDataState(state: RefreshProblemsState): void {
    this.refreshProblemsState.next(state);
  }

  getProblems(tag: string): Observable<Problem[]> {
    return this.apiService._getProblems(tag);
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

  createNewProblem(obj: { description: string; tags: string[] }): Observable<Problem> {
    return this.apiService._createNewProblem(obj);
  }

  openAddProblemDialog(taskContainer: TaskContainer) {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Description'}});
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const obj = {description: description, tags: [taskContainer.getFullDescription()]}
        const state = this.getRefreshProblemsDataCurrentState();
        this.createNewProblem(obj).subscribe(() =>
          this.setRefreshProblemsDataState({...state, taskContainer: taskContainer}));
      }
    });
  }

  callSolveTheProblemDialog(problem: Problem, taskContainer: TaskContainer) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        const state = this.getRefreshProblemsDataCurrentState();
        this.solveTheProblem(problem, solution)
          .subscribe(() => this.setRefreshProblemsDataState({
            ...state,
            taskContainer: taskContainer,
            lastSolvedProblem: problem}));
      }
    });

    }

  getParentsPath(problem: Problem): Observable<string[]> {
    return this.apiService._getProblemParentsPath(problem);
  }


}
