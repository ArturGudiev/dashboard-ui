import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Question} from "../models/question";
import {ApiService} from "./api.service";
import {tap} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {GetValueDialogComponent} from "../modules/dialogs/get-value/get-value-dialog.component";
import {NEW_QUESTION_DIALOG_OPTIONS} from "../shared/constants";
import {MatDialog} from "@angular/material/dialog";
import {TaskContainer} from "../interfaces/task-container";

export interface RefreshQuestionsState {
  taskContainer: TaskContainer;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private apiService: ApiService,
              private dialog: MatDialog,
              private dashboardService: DashboardService) {
  }

  private initialRefreshQuestionsState: RefreshQuestionsState = {
    taskContainer: null
  }
  private refreshQuestionsState = new BehaviorSubject<RefreshQuestionsState>(this.initialRefreshQuestionsState);

  getRefreshQuestionsDataCurrentState(): RefreshQuestionsState {
    return this.refreshQuestionsState.getValue();
  }

  getRefreshQuestionsDataStateChange(): Observable<RefreshQuestionsState> {
    return this.refreshQuestionsState.asObservable();
  }

  setRefreshQuestionsDataState(state: RefreshQuestionsState): void {
    this.refreshQuestionsState.next(state);
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

  openAddQuestionDialog(taskContainer: TaskContainer): void {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Description', inputWidth: '40rem'},
        ...NEW_QUESTION_DIALOG_OPTIONS
      });
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const obj = {description: description, tags: [taskContainer.getFullDescription()]}
        const state = this.getRefreshQuestionsDataCurrentState();
        this.createNewQuestion(obj).subscribe(() =>
          this.setRefreshQuestionsDataState({...state, taskContainer: taskContainer}));
      }
    });
  }
}
