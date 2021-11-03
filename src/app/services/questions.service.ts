import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Question} from "../models/question";
import {ApiService} from "./api.service";
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private apiService: ApiService,
              private dashboardService: DashboardService) { }

  getQuestions(tag: string): Observable<Question[]> {
    return this.apiService._getQuestions(tag);

  }

  createNewQuestion(obj: { description: string; tags: string[] }): Observable<Question> {
    return this.apiService._createNewQuestion(obj);
  }

  finishQuestion(question: Question): Observable<any> {
    throw Error('not implemented finish question');

  }

  answerTheQuestion(question: Question, answer: string): Observable<any> {
    return this.apiService._answerTheQuestion(question._id, answer).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }
}
