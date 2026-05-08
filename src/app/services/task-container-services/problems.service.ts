import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { filter, map, switchMap, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "../api.service";
import { TaskContainer } from "../../models/interfaces/task-container";
import { Problem } from "../../models/problem";
import { DashboardService } from "../dashboard.service";
import { GetValueDialogComponent } from "../../components/dialogs/get-value/get-value-dialog.component";
import { NEW_TASK_DIALOG_OPTIONS } from "../../shared/constants";

export interface RefreshProblemsState {
  taskContainer: TaskContainer;
  lastSolvedProblem: Problem;
}

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {

  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private dashboardService = inject(DashboardService);

  getAllProblems(ids: number[]): Observable<Problem[]> {
    return this.apiService._getProblems(ids);
  }

  getProblems(ids: number[]): Observable<Problem[]> {
    return this.apiService._getProblems(ids).pipe(map(arr => arr.filter(e => Boolean(!e.solution))));
  }

  finishProblem(problem: Problem): Observable<any> {
    throw Error('not implemented finish problem');
  }

  getProblem(id: any): Observable<Problem> {
    return this.apiService._getProblem(id);
  }

  solveTheProblem(problem: Problem, solution: string): Observable<any> {
    return this.apiService._solveTheProblem(problem.id, solution).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }

  createNewProblem(obj: any): Observable<Problem> {
    return this.apiService._createNewProblem(obj);
  }

  createProblemFromDialog(taskContainer: TaskContainer): Observable<Problem> {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {
        data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_TASK_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed()
      .pipe(
        filter((description: string) => !!description),
        switchMap((description: string) => {
          const problem = {
            description: description,
            tags: [],
            notes: "",
          };
          const parent = { id: taskContainer.id, type: taskContainer.type };
          return this.createNewProblem({ problem, parent });
        })
      )
  }

  callSolveTheProblemDialog(problem: Problem, taskContainer: TaskContainer) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.solveTheProblem(problem, solution).subscribe();
      }
    })
  }

  updateProblem(problem: Problem): Observable<Problem> {
    return this.apiService.updateProblem(problem);
  }
}
