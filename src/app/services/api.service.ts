import { Injectable } from '@angular/core';
import { TaskC } from '../models/task-class';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Epic } from "../models/epic";
import { Story } from "../models/story";
import { Problem } from "../models/problem";
import { Question } from "../models/question";
import { Knowledge } from "../models/knowledge";
import { AliasesRecord } from "../models/alias-record";
import { RecordItem } from "../models/record-item";
import { Action } from '../models/classes/action';
import { TaskContainer } from "../models/interfaces/task-container";
import { IArrayParams } from "../models/interfaces/array-params";

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
  // baseUrl = 'http://192.168.1.62:3000'
  baseUrl = 'http://192.168.1.107:3000'
  // baseUrl = 'http://172.20.10.11:3000'
  // baseUrl = 'http://localhost:3000'

  constructor(private http: HttpClient) {
  }


  _getTask(id: number): Observable<TaskC> {
    return this.http.get<TaskC>(`${this.baseUrl}/task/${id}`)
      .pipe(
        map((obj) => TaskC.createFromObj(obj))
      );
  }

  _getParentsPath(obj: TaskContainer): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/parents-path/`, obj);
  }

  _getTasks(ids: number[]): Observable<TaskC[]> {
    return this.http.post(`${this.baseUrl}/get-tasks/`,
      { ids }
    ).pipe(
      map((tasks: any) => tasks.map((t: TaskC) => TaskC.createFromObj(t))
      ));
  }

  _createNewTask(obj: any): Observable<TaskC> {
    return this.http.post<TaskC>(`${this.baseUrl}/new-task/`, obj).pipe(map(TaskC.createFromObj));
  }

  _finishTask(task: TaskC): Observable<any> {
    return this.http.put(`${this.baseUrl}/finish-task/${task._id}`, {});
  }

  _finishTaskById(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/finish-task/${id}`, {});
  }


  _finishTasks(tasks: TaskC[]) {
    return this.http.put(`${this.baseUrl}/finish-tasks/`, tasks).pipe();
  }

  _finishTasksByIds(ids: number[]) {
    return this.http.put(`${this.baseUrl}/finish-tasks-by-ids/`, ids).pipe();
  }

  _addAnonymousTask(): Observable<any> {
    return this.http.put(`${this.baseUrl}/add-anonymous-task/`, {});
  }

  _updateTask(task: TaskC): Observable<TaskC> {
    return this.http.put<TaskC>(`${this.baseUrl}/update-task/`, task)
      .pipe(
        map((obj) => TaskC.createFromObj(obj))
      );
  }

  _getDoneTasksNumber() {
    // return this.http.get(`${this.baseUrl}/done-tasks-number/`);
    return this.http.get(`${this.baseUrl}/done-tasks/`);
  }

  //-----------------------------------------epics--------------------------------------------
  _getEpic(id: number) {
    return this.http.get<Epic>(`${this.baseUrl}/epic/${id}`)
      .pipe(
        map((obj) => Epic.createFromObj(obj))
      );
  }

  _getAllEpics(): Observable<Epic[]> {
    return this.http.get<Epic[]>(`${this.baseUrl}/epics/`)
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

  _getEpicParentsPath(epic: any): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/epic/parents-path/`, epic);
  }

  _updateEpic(epic: Epic): Observable<Epic> {
    return this.http.put<Epic>(`${this.baseUrl}/update-epic/`, epic)
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
    return this.http.post(`${this.baseUrl}/get-stories/`,
      { ids }
    ).pipe(
      map((stories: any) => stories.map(
        (s: Story) => Story.createFromObj(s))
      ));
  }

  _updateStory(story: Story): Observable<Story> {
    return this.http.put<Story>(`${this.baseUrl}/update-story/`, story)
      .pipe(
        map((obj) => Story.createFromObj(obj))
      );
  }
  //------------------------------------stories-------------------------------------------------
  //------------------------------------problems-------------------------------------------------

  _getProblems(ids: number[]): Observable<Problem[]> {
    return this.http.post(`${this.baseUrl}/get-problems/`, { ids }).pipe(
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
    return this.http.put<Problem>(`${this.baseUrl}/update-problem/`, problem)
      .pipe(
        map((obj) => Problem.createFromObj(obj))
      );
  }

  _createNewProblem(obj: any): Observable<Problem> {
    return this.http.post<Problem>(`${this.baseUrl}/new-problem`, obj);
  }

  _getProblemParentsPath(problem: any): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/problem/parents-path/`, problem);
  }

  //----------------------------------------problems-----------------------------------------
  //----------------------------------------aliases----------------------------------------
  _getAlias(alias: string): Observable<AliasesRecord> {
    return this.http.get<AliasesRecord>(`${this.baseUrl}/alias-record/${alias}`)
      .pipe(
        map((obj) => new AliasesRecord(obj))
      );
  }

  //----------------------------------------aliases----------------------------------------
  //----------------------------------------questions----------------------------------------
  _getQuestions(ids: number[]): Observable<Question[]> {
    return this.http.post(`${this.baseUrl}/get-questions/`, { ids }).pipe(
      map((questions: any) => questions.map(
        (p: Question) => Question.createFromObj(p)
      )));
  }

  updateQuestion(question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/update-question/`, question)
      .pipe(
        map((obj) => Question.createFromObj(obj))
      );
  }

  _createNewQuestion(obj: any): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/new-question/`, obj);
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

  _getQuestionParentsPath(question: Question): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/question/parents-path/`, question);
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

  _getActionParentsPath(action: Action): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/action/parents-path/`, action);
  }
  //------------------------------------actions----------------------------------------
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

  _getKnowledgeParentsPath(knowledge: Knowledge): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/knowledge/parents-path/`, knowledge);
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

}
