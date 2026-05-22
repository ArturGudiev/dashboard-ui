import { inject, Injectable } from '@angular/core';
import { TaskC } from '../models/task-class';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Epic } from "../models/epic";
import { Story } from "../models/story";
import { Problem } from "../models/problem";
import { Question } from "../models/question";
import { Knowledge } from "../models/knowledge";
import { RecordItem } from "../models/record-item";
import { Action } from '../models/classes/action';
import { TaskContainer } from "../models/interfaces/task-container";
import { IArrayParams } from "../models/interfaces/array-params";
import { AppConfigService } from './app-config.service';
import {
  EntLogMessage,
  EntRepetitiveTaskExecution,
  HandlersNewLogMessageRequest,
  HandlersNewRepetitiveTaskRequest,
  HandlersPaginatedResponseEntLogMessage,
  ModelsAliasModel,
  ModelsRepetitiveTaskResponse
} from "../types/generated";
import { TaskContainerType } from "../models/interfaces/types";
import {
  toEpicPartial,
  toProblemPartial,
  toQuestionPartial,
  toStoryPartial,
} from '../shared/libs/container-update.lib';

export interface IArrayResponse<T> {
  arrInfo: {
    length: number
  },
  items: T[]
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  get baseUrl(): string {
    return this.appConfig.baseUrl;
  }

  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  _getTask(id: number): Observable<TaskC> {
    return this.http.get<TaskC>(`${this.baseUrl}/task/${id}`)
      .pipe(
        map((obj) => TaskC.createFromObj(obj))
      );
  }

  _getParentsPath(obj: TaskContainer): Observable<string[]> {
    const body = { type: obj.type, id: obj.id };
    return this.http.post<string[]>(`${this.baseUrl}/parents-path`, body).pipe(map(arr => arr.reverse()));
  }

  _getTasks(ids: number[]): Observable<TaskC[]> {
    return this.http.post(`${this.baseUrl}/get-tasks`,
      { ids }
    ).pipe(
      map((tasks: any) => tasks.map((t: TaskC) => TaskC.createFromObj(t))
      ));
  }

  _createNewTask(obj: any): Observable<TaskC> {
    return this.http.post<TaskC>(`${this.baseUrl}/new-task`, obj).pipe(map(TaskC.createFromObj));
  }

  _finishTask(task: TaskC): Observable<any> {
    return this.http.put(`${this.baseUrl}/finish-task/${task.id}`, {});
  }

  _finishTaskById(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/finish-task/${id}`, {});
  }


  _finishTasks(tasks: TaskC[]) {
    return this.http.put(`${this.baseUrl}/finish-tasks-by-ids/`, tasks.map(el => el.id)).pipe();
  }

  _finishTasksByIds(ids: number[]) {
    return this.http.put(`${this.baseUrl}/finish-tasks-by-ids/`, ids).pipe();
  }

  _addAnonymousTask(): Observable<any> {
    return this.http.put(`${this.baseUrl}/add-anonymous-task`, {});
  }

  _updateTask(task: TaskC): Observable<TaskC> {
    return this.http.put<TaskC>(`${this.baseUrl}/update-task`, {
      id: task.id,
      description: task.description,
      notes: task.notes,
      tags: task.tags,
      done: task.done,
    }).pipe(
      map((obj) => TaskC.createFromObj(obj)),
    );
  }

  _getDoneTasksNumber(from: string | null) {
    console.log('===== _getDoneTasksNumber', from);
    let params = new HttpParams();
    if (from) {
      params = params.set('from', String(from));
    }
    return this.http.get(`${this.baseUrl}/done-tasks`, { params });
  }

  //-----------------------------------------epics--------------------------------------------
  _getEpic(id: number) {
    return this.http.get<Epic>(`${this.baseUrl}/epic/${id}`)
      .pipe(
        map((obj) => Epic.createFromObj(obj))
      );
  }

  _getAllEpics(): Observable<Epic[]> {
    return this.http.get<Epic[]>(`${this.baseUrl}/epics`)
      .pipe(
        map((arr) => arr.map(obj => Epic.createFromObj(obj)))
        );
  }

  _getEpics(ids: number[]): Observable<Epic[]> {
    return this.http.post<Epic[]>(`${this.baseUrl}/get-epics`, {ids})
      .pipe(
        map((epicsObjArr: Epic[]) => epicsObjArr.map(epicObj => Epic.createFromObj(epicObj)))
      );
  }

  _updateEpic(epic: Epic): Observable<Epic> {
    return this.http.put<Epic>(`${this.baseUrl}/update-epic`, toEpicPartial(epic))
      .pipe(
        map((obj) => Epic.createFromObj(obj))
      );
  }

//------------------------------------stories-------------------------------------------------
  _getStory(id: number) {
    return this.http.get<Story>(`${this.baseUrl}/story/${id}`)
      .pipe(
        map((obj) => Story.createFromObj(obj))
      );
  }

  _getStories(ids: number[]): Observable<Story[]> {
    return this.http.post(`${this.baseUrl}/get-stories`,
      { ids }
    ).pipe(
      map((stories: any) => stories.map(
        (s: Story) => Story.createFromObj(s))
      ));
  }

  _updateStory(story: Story): Observable<Story> {
    return this.http.put<Story>(`${this.baseUrl}/update-story`, toStoryPartial(story))
      .pipe(
        map((obj) => Story.createFromObj(obj))
      );
  }

  _createNewStory(obj: { story: { description: string; tags: string[]; notes: string }; parent: { id: number; type: string } }): Observable<Story> {
    return this.http.post<Story>(`${this.baseUrl}/new-story`, obj).pipe(
      map((obj) => Story.createFromObj(obj)),
    );
  }
  //------------------------------------stories-------------------------------------------------
  //------------------------------------problems-------------------------------------------------

  _getProblems(ids: number[]): Observable<Problem[]> {
    return this.http.post(`${this.baseUrl}/get-problems`, { ids }).pipe(
      map((problems: any) => problems.map(
        (p: Problem) => Problem.createFromObj(p)
      )));
  }

  _getProblem(id: any) {
    return this.http.get<Problem>(`${this.baseUrl}/problem/${id}`)
      .pipe(
        map((obj) => Problem.createFromObj(obj))
      );
  }

  _solveTheProblem(_id: number, solution: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/solve-problem/${_id}`, {solution});
  }

  updateProblem(problem: Problem): Observable<Problem> {
    return this.http.put<Problem>(`${this.baseUrl}/update-problem`, toProblemPartial(problem))
      .pipe(
        map((obj) => Problem.createFromObj(obj))
      );
  }

  _createNewProblem(obj: any): Observable<Problem> {
    return this.http.post<Problem>(`${this.baseUrl}/new-problem`, obj);
  }

  //----------------------------------------problems-----------------------------------------
  //----------------------------------------aliases----------------------------------------
  _getAlias(alias: string): Observable<ModelsAliasModel> {
    return this.http.get<ModelsAliasModel>(`${this.baseUrl}/aliases/${alias}`);
  }

  //----------------------------------------aliases----------------------------------------
  //----------------------------------------questions----------------------------------------
  _getQuestions(ids: number[]): Observable<Question[]> {
    return this.http.post(`${this.baseUrl}/get-questions`, { ids }).pipe(
      map((questions: any) => questions.map(
        (p: Question) => Question.createFromObj(p)
      )));
  }

  updateQuestion(question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/update-question`, toQuestionPartial(question))
      .pipe(
        map((obj) => Question.createFromObj(obj))
      );
  }

  _createNewQuestion(obj: any): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/new-question`, obj);
  }

  _answerTheQuestion(_id: number, answer: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/answer-question/${_id}`, {answer});
  }

  _getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/question/${id}`)
      .pipe(
        map((obj) => Question.createFromObj(obj))
      );
  }

  //----------------------------------------questions------------------------------------------

  //------------------------------------actions----------------------------------------
  _getActions(ids: number[]) {
    return this.http.post(`${this.baseUrl}/get-actions/`, { ids }).pipe(
      map((actions: any) => actions.map(
        (a: Action) => Action.createFromObj(a)
      )));
  }

  _createNewAction(actionObject: {name: any; value: any; tags: string[], extension: string}): Observable<Action> {
    return this.http.post<Action>(`${this.baseUrl}/new-action/`, actionObject);
  }

  _getAction(id: number) {
    return this.http.get<Action>(`${this.baseUrl}/action/${id}`)
      .pipe(
        map((obj: Action) => Action.createFromObj(obj))
      );
  }

  _updateAction(action: Action): Observable<Action> {
    return this.http.post<Action>(`${this.baseUrl}/update-action/`, action)
      .pipe(
        map((obj: Action) => Action.createFromObj(obj))
      );
  }

  //------------------------------------actions----------------------------------------
  //------------------------------------logs----------------------------------------
  getLogs(containerType?: TaskContainerType, containerId?: number): Observable<EntLogMessage> {
    const url = containerType && containerId
      ? `${this.baseUrl}/log-messages/${containerType}/${containerId}`
      : `${this.baseUrl}/log-messages`;
    return this.http.get<EntLogMessage>(url);
  }

  addLogMessage(body: HandlersNewLogMessageRequest) {
    return this.http.post<EntLogMessage>(`${this.baseUrl}/log-messages`, body);
  }

  getLogMessages({ taskContainer, perPage, page, global }: { taskContainer?: TaskContainer, perPage?: number, page?: number, global?: boolean }) {
    let myParams = new HttpParams();
    if (taskContainer) {
      myParams = myParams.set('containerType', taskContainer.type).set('containerID', taskContainer.id);
    }
    if (perPage) {
      myParams = myParams.set('perPage', perPage);
    }
    if (page) {
      myParams = myParams.set('page', page);
    }
    if (global) {
      myParams = myParams.set('global', true);
    }
    return this.http.get<HandlersPaginatedResponseEntLogMessage>(`${this.baseUrl}/log-messages`, { params: myParams });
  }

  //------------------------------------logs----------------------------------------
  //------------------------------------knowledge bits start----------------------------------------
  _getKnowledgeBits(ids: number[]) {
    return this.http.post(`${this.baseUrl}/get-knowledge-bits/`, { ids }).pipe(
      map((knowledgeBits: any) => knowledgeBits.map(
        (a: Knowledge) => Knowledge.createFromObj(a)
      )));
  }

  _createNewKnowledge(knowledgeObject: {name: any; value: any; tags: string[], extension: string}): Observable<Knowledge> {
    return this.http.post<Knowledge>(`${this.baseUrl}/new-knowledge/`, knowledgeObject);
  }

  _getKnowledge(id: number) {
    return this.http.get<Knowledge>(`${this.baseUrl}/knowledge/${id}`)
      .pipe(
        map((obj: Knowledge) => Knowledge.createFromObj(obj))
      );
  }

  _updateKnowledge(knowledge: Knowledge): Observable<Knowledge> {
    return this.http.post<Knowledge>(`${this.baseUrl}/update-knowledge/`, knowledge)
      .pipe(
        map((obj: Knowledge) => Knowledge.createFromObj(obj))
      );
  }

  _getRecordItems(arrayParams: IArrayParams, tag?: string): Observable<IArrayResponse<RecordItem>> {
    console.log('_getRecordItems', arrayParams);
    const url = tag ? `${this.baseUrl}/records/${tag}` : `${this.baseUrl}/records`;
    return this.http.post<IArrayResponse<RecordItem>>(url, {
    }, {
      params: {
        offset: arrayParams.offset,
        count: arrayParams.pageSize
      }
    }).pipe(
      map((obj: IArrayResponse<RecordItem>) => {
        obj.items = obj.items.map((el: any) => RecordItem.createRecordsItemFromObj(el));
        return obj;
      })
    );
  }

  _addRecord(message: string, tag?: string): Observable<RecordItem> {
    const bodyObj: any = {
      message: message,
    };
    if (tag) {
      bodyObj.tags = [tag];
    }
    console.log(bodyObj);
    return this.http.post<RecordItem>(`${this.baseUrl}/new-record/`, bodyObj);
  }
  //------------------------------------knowledge bits end----------------------------------------

  //------------------------------------ reports ----------------------------------------
  getReport(obj: TaskContainer): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/report/`, obj);
  }

  getTaskReport(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/task-report/${id}`);
  }
  //------------------------------------ reports ----------------------------------------

  //------------------------------------ repetitive tasks  ----------------------------------------
  _getAllRepetitiveTasks(actual = true): Observable<ModelsRepetitiveTaskResponse[]> {
    return this.http.get<ModelsRepetitiveTaskResponse[]>(`${this.baseUrl}/repetitive-tasks`, {
      params: new HttpParams({ fromObject: { actual }} )
    });
  }

  _markRepetitiveTaskAsDone(id: number): Observable<EntRepetitiveTaskExecution> {
    return this.http.post<EntRepetitiveTaskExecution>(
      `${this.baseUrl}/repetitive-tasks/${id}/executions`,
      { }
    );
  }

  _createRepetitiveTask(obj: HandlersNewRepetitiveTaskRequest): Observable<ModelsRepetitiveTaskResponse> {
    return this.http.post<ModelsRepetitiveTaskResponse>(
      `${this.baseUrl}/new-repetitive-task`,
      { ...obj }
    );
  }
  //------------------------------------ repetitive tasks  ----------------------------------------

}
