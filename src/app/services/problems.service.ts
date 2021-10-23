import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";
import {Observable} from "rxjs";
import {Problem} from "../models/problem";

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {

  constructor(private apiService: ApiService) { }

  getProblems(tag: string): Observable<Problem[]> {
    return this.apiService._getProblems(tag);
  }

  finishProblem(problem: Problem): Observable<any> {
    throw Error('not implemented finish problem' );
  }

  getProblem(id: any): Observable<Problem> {
    return this.apiService._getProblem(id);
  }

  solveTheProblem(problem: Problem, solution: string): Observable<any> {
    return this.apiService._solveTheProblem(problem._id, solution)
  }
}
