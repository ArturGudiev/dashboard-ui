import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Question } from "../models/question";
import { ApiService } from "./api.service";
import { filter, map, switchMap, tap } from "rxjs/operators";
import { DashboardService } from "./dashboard.service";
import { GetValueDialogComponent } from "../components/dialogs/get-value/get-value-dialog.component";
import { NEW_QUESTION_DIALOG_OPTIONS } from "../shared/constants";
import { MatDialog } from "@angular/material/dialog";
import { TaskContainerDescription } from "../models/interfaces/types";
import { TaskContainer } from "../models/interfaces/task-container";


@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private apiService: ApiService,
              private dialog: MatDialog,
              private dashboardService: DashboardService) {
  }


  getAllQuestions(ids: number[]): Observable<Question[]> {
    return this.apiService._getQuestions(ids);
  }

  getQuestions(ids: number[]): Observable<Question[]> {
    return this.apiService._getQuestions(ids).pipe(map(arr => arr.filter(e => !e.answer)));
  }

  createNewQuestion(obj: { description: string; tags: string[],
      parents: TaskContainerDescription[]
    }): Observable<Question> {
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

  createQuestionFromDialog(taskContainer: TaskContainer): Observable<Question> {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_QUESTION_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed()
    .pipe(
      filter((description: string) => !!description),
      switchMap((description: string) => {
        const obj: any = {
          description: description,
          tags: [],
          parents: [taskContainer.getTaskContainerDescription()]
        };
        return this.createNewQuestion(obj);
      })
    )

    // .subscribe((description: string) => {
    //   if (description) {
    //     const obj: any = {description: description, tags: [],
    //         parents: [taskContainer.getTaskContainerDescription()]
    //       }
    //     const state = this.getRefreshQuestionsDataCurrentState();
    //     this.createNewQuestion(obj).subscribe(() =>
    //       this.setRefreshQuestionsDataState({...state, taskContainer: taskContainer}));
    //   }
    // });

  }

  updateQuestion(question: Question): Observable<Question> {
    return this.apiService.updateQuestion(question);
  }
}
