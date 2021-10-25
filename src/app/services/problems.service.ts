import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {Observable} from "rxjs";
import {Problem} from "../models/problem";
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";

@Injectable({
    providedIn: 'root'
})
export class ProblemsService {

    constructor(private apiService: ApiService,
                private dashboardService: DashboardService
    ) {
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
}
