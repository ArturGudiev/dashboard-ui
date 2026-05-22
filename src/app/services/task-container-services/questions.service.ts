import { inject, Injectable } from '@angular/core';
import { type Observable } from "rxjs";
import { filter, map, switchMap, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ApiService } from "../api.service";
import { DashboardService } from "../dashboard.service";
import { type Question } from "../../models/question";
import { type TaskContainer } from "../../models/interfaces/task-container";
import { GetValueDialogComponent } from "../../components/dialogs/get-value/get-value-dialog.component";
import { NEW_QUESTION_DIALOG_OPTIONS } from "../../shared/constants";
import {
  type HandlersNewQuestionRequest,
  type ModelsQuestionFull,
  type ModelsQuestionShort
} from "../../types/generated";


@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private dashboardService = inject(DashboardService);

  getAllQuestions(ids: number[]): Observable<Question[]> {
    return this.apiService._getQuestions(ids);
  }

  getQuestions(ids: number[]): Observable<Question[]> {
    return this.apiService._getQuestions(ids).pipe(map(arr => arr.filter(e => !e.answer)));
  }

  createNewQuestion(obj: HandlersNewQuestionRequest): Observable<Question> {
    return this.apiService._createNewQuestion(obj);
  }

  // finishQuestion(question: Question): Observable<any> {

  //   throw Error('not implemented finish question');

  // }

  answerTheQuestion(question: Question, answer: string): Observable<ModelsQuestionFull> {
    return this.apiService._answerTheQuestion(question.id, answer).pipe(
      tap({
        complete: () => this.dashboardService.updateDoneTasksNumber()
      }));
  }

  getQuestion(id: number): Observable<Question> {
    return this.apiService._getQuestion(id);
  }

  createQuestionFromDialog(taskContainer: TaskContainer): Observable<Question> {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_QUESTION_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed()
    .pipe(
      filter((description: string) => !!description),
      switchMap((description: string) => {
        const question: ModelsQuestionShort = {
          description: description,
          tags: [],
          notes: "",
        };
        const parent = { id: taskContainer.id, type: taskContainer.type };
        return this.createNewQuestion({ question, parent });
      })
    )
  }

  updateQuestion(question: Question): Observable<Question> {
    return this.apiService.updateQuestion(question);
  }
}
