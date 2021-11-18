import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {Question} from "../models/question";
import {ApiService} from "./api.service";
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {GetValueDialogComponent} from "../modules/dialogs/get-value/get-value-dialog.component";
import {NEW_QUESTION_DIALOG_OPTIONS} from "../shared/constants";
import {MatDialog} from "@angular/material/dialog";
import {TaskContainer} from "../interfaces/task-container";

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private apiService: ApiService,
              private dialog: MatDialog,
              private dashboardService: DashboardService) {
  }

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

  getQuestion(id: number): Observable<Question> {
    return this.apiService._getQuestion(id);
  }

  getQuestionParentsPath(question: Question): Observable<string[]> {
    return this.apiService._getQuestionParentsPath(question);
  }

  async openAddQuestionDialog(taskContainer: TaskContainer): Promise<any> {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {
      data: {title: 'Description', inputWidth: '40rem'},
      ...NEW_QUESTION_DIALOG_OPTIONS
    });
    const description: string = await dialogRef.afterClosed().toPromise();
    if (description) {
      const obj = {description: description, tags: [taskContainer.getFullDescription()]}
      return this.createNewQuestion(obj);
    }
    return of(null);
  }
}
