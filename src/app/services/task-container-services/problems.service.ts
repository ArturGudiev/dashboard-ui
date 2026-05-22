import { inject, Injectable } from '@angular/core';
import { type Observable } from "rxjs";
import { filter, map, switchMap, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "../api.service";
import { type TaskContainer } from "../../models/interfaces/task-container";
import { type Problem } from "../../models/problem";
import { DashboardService } from "../dashboard.service";
import { GetValueDialogComponent } from "../../components/dialogs/get-value/get-value-dialog.component";
import { GET_VALUE_DIALOG_OPTIONS, NEW_TASK_DIALOG_OPTIONS } from "../../shared/constants";
import {
  type HandlersNewProblemRequest,
  type ModelsProblemFull,
  type ModelsProblemShort
} from "../../types/generated";

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

  finishProblem(problem: Problem): Observable<ModelsProblemFull> {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {
      data: { title: 'Solution', inputWidth: '40rem' },
      ...GET_VALUE_DIALOG_OPTIONS,
    });
    return dialogRef.afterClosed().pipe(
      filter((solution: string): solution is string => !!solution),
      switchMap((solution: string) => this.solveTheProblem(problem, solution)),
    );
  }

  getProblem(id: number): Observable<Problem> {
    return this.apiService._getProblem(id);
  }

  solveTheProblem(problem: Problem, solution: string): Observable<ModelsProblemFull> {
    return this.apiService._solveTheProblem(problem.id, solution).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }

  createNewProblem(obj: HandlersNewProblemRequest): Observable<Problem> {
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
          const problem: ModelsProblemShort = {
            description: description,
            tags: [],
            notes: "",
          };
          const parent = { id: taskContainer.id, type: taskContainer.type };
          return this.createNewProblem({ problem, parent });
        })
      )
  }

  callSolveTheProblemDialog(problem: Problem) {
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
