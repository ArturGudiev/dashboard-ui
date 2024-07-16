import {Injectable} from '@angular/core';
import {TaskC} from '../models/task-class';
import {HttpClient} from '@angular/common/http';
import {EMPTY, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Epic} from "../models/epic";
import {TaskContainer} from "../interfaces/task-container";
import {Story} from "../models/story";
import {Problem} from "../models/problem";
import {Question} from "../models/question";
import {Definition} from "../models/definition";
import {Action} from "../models/action";
import {Knowledge} from "../models/knowledge";
import {KnowledgeNode} from "../models/knowledge-node";
import {AliasesRecord} from "../models/alias-record";
import {RecordItem} from "../models/record-item";
import {IArrayParams} from "../interfaces/array-params";
import {TaskContainerDescription} from "../interfaces/types";

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
    return this.http.post<string[]>(`${this.baseUrl}/task/parents-path/`, obj);
  }

  _getTasks(ids: number[]): Observable<TaskC[]> {
    return this.http.post(`${this.baseUrl}/get-tasks/`,
      { ids }
    ).pipe(
      map((tasks: any) => tasks.map((t: TaskC) => TaskC.createFromObj(t))
      ));
  }

  _createNewTask(obj: any): Observable<TaskC> {
    console.log('_createNewTask', obj);
    return this.http.post<TaskC>(`${this.baseUrl}/new-task/`, obj);
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

  _getEpics(ids: number[]): Observable<Epic[]> {
    return this.http.post<Epic[]>(`${this.baseUrl}/get-epics`, {ids})
      .pipe(
        map((epicsObjArr: Epic[]) => epicsObjArr.map(epicObj => Epic.createFromObj(epicObj)))
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
  //----------------------------------------definitions----------------------------------------
  _getDefinitions(ids: number[]): Observable<Definition[]> {
    console.log('_getDefinitions', ids);
    return this.http.post(`${this.baseUrl}/get-definitions/`, { ids }).pipe(
      map((definitions: any) => definitions.map(
        (p: Definition) => Definition.createFromObj(p)
      )));
  }

  _createNewDefinition(definitionObject: any): Observable<Definition> {
    return this.http.post<Definition>(`${this.baseUrl}/new-definition/`, definitionObject);
  }

  _getDefinition(id: number) {
    return this.http.get<Definition>(`${this.baseUrl}/definition/${id}`)
      .pipe(
        map((obj: Definition) => Definition.createFromObj(obj))
      );
  }

  _updateDefinition(definition: Definition): Observable<Definition> {
    return this.http.post<Definition>(`${this.baseUrl}/update-definition/`, definition)
      .pipe(
        map((obj: Definition) => Definition.createFromObj(obj))
      );
  }

  _getDefinitionParentsPath(definition: Definition): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/definition/parents-path/`, definition);
  }

  //------------------------------------definitions----------------------------------------
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
        map((obj: Action) => Action.createFromObj(action))
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
  //------------------------------------knowledge bits end----------------------------------------
  //------------------------------------knowledge bits start----------------------------------------


  _getKnowledgeNode(id: number): Observable<KnowledgeNode> {
    return this.http.get(`${this.baseUrl}/get-knowledge-node/${id}`).pipe(
      map((obj: any) => KnowledgeNode.createFromObj(obj))
    );
  }

  _getKnowledgeNodeParentsPath(node: KnowledgeNode): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/knowledge-node/parents-path/`, node);
  }

  _getKnowledgeNodeChildren(id: any): Observable<KnowledgeNode[]> {
    return this.http.get(`${this.baseUrl}/get-knowledge-node-children/${id}`)
      .pipe(
        map((nodes: any) => nodes.map(
          (a: any) => KnowledgeNode.createFromObj(a)
        ))
      );
  }
  //------------------------------------knowledge bits end----------------------------------------

  _createNewKnowledgeNode(obj: { name: string; id: number }) {
    return this.http.post<string[]>(`${this.baseUrl}/new-knowledge-node/`, obj);
  }

  _deleteKnowledgeNode(node: KnowledgeNode): Observable<any> {
    return this.http.delete<string[]>(`${this.baseUrl}/delete-knowledge-node/${node._id}`);
  }
  //------------------------------------knowledge bits end----------------------------------------
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
