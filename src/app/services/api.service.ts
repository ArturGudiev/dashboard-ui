import {Injectable} from '@angular/core';
import {Task} from '../models/task-class';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = 'http://192.168.1.62:3000'

  constructor(private http: HttpClient) {
  }


  _getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/task/${id}`)
      .pipe(
        map((obj) => new Task(obj._id, obj.description, obj.done, obj.tags))
      );
  }

  _getParentsPath(obj: TaskContainer): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/task/parents-path/`, obj);
  }

  _getTasks(tag: string): Observable<Task[]> {
    return this.http.get(`${this.baseUrl}/get-tasks/`, {
      params: {tag}
    }).pipe(
      map((tasks: any) => tasks.map((t: Task) => new Task(t._id, t.description, t.done, t.tags))
      ));
  }

  _createNewTask(obj: { description: any; tags: string[] }): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/new-task/`, obj);
  }

  _finishTask(task: Task): Observable<any> {
    return this.http.put(`${this.baseUrl}/finish-task/${task._id}`, {});
  }

  _finishTasks(tasks: Task[]) {
    return this.http.put(`${this.baseUrl}/finish-tasks/`, tasks).pipe();
  }

  _addAnonymousTask(): Observable<any> {
    return this.http.put(`${this.baseUrl}/add-anonymous-task/`, {});

  }

  _getDoneTasksNumber() {
    // return this.http.get(`${this.baseUrl}/done-tasks-number/`);
    return this.http.get(`${this.baseUrl}/done-tasks/`);
  }

  //-----------------------------------------epics--------------------------------------------
  _getEpic(id: number) {
    return this.http.get<Epic>(`${this.baseUrl}/epic/${id}`)
      .pipe(
        map((obj) => new Epic(obj._id, obj.description, obj.tags, obj.active, obj.closed))
      );
  }

//------------------------------------stories-------------------------------------------------
  _getStory(id: number) {
    return this.http.get<Story>(`${this.baseUrl}/story/${id}`)
      .pipe(
        map((obj) => new Story(obj._id, obj.description, obj.tags, obj.active, obj.closed))
      );
  }

  _getStories(tag: string): Observable<Story[]> {
    return this.http.get(`${this.baseUrl}/get-stories/`, {
      params: {tag}
    }).pipe(
      map((stories: any) => stories.map(
        (s: Story) => new Story(s._id, s.description, s.tags, s.active, s.closed, s.deferred))
      ));

  }
  //------------------------------------stories-------------------------------------------------
  //------------------------------------problems-------------------------------------------------

  _getProblems(tag: string): Observable<Problem[]> {
    return this.http.get(`${this.baseUrl}/get-problems/`, {
      params: {tag}
    }).pipe(
      map((problems: any) => problems.map(
        (p: Problem) => new Problem(p._id, p.description, p.tags, p.solution)
      )));
  }

  _getProblem(id: any) {
    return this.http.get<Problem>(`${this.baseUrl}/problem/${id}`)
      .pipe(
        map((obj) => new Problem(obj._id, obj.description, obj.tags, obj.solution))
      );
  }

  _solveTheProblem(_id: number, solution: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/solve-problem/${_id}`, {solution});
  }

  _createNewProblem(obj: { description: string; tags: string[] }): Observable<Problem> {
    return this.http.post<Problem>(`${this.baseUrl}/new-problem/`, obj);
  }
  //----------------------------------------problems-----------------------------------------
  //----------------------------------------questions----------------------------------------
  _getQuestions(tag: string): Observable<Question[]> {
    return this.http.get(`${this.baseUrl}/get-questions/`, {
      params: {tag}
    }).pipe(
      map((questions: any) => questions.map(
        (p: Question) => new Question(p._id, p.description, p.tags, p.answer)
      )));
  }

  _createNewQuestion(obj: {description: string; tags: string[]}): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/new-question/`, obj);
  }

  _answerTheQuestion(_id: number, answer: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/answer-question/${_id}`, {answer});
  }

  _getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/question/${id}`)
      .pipe(
        map((obj) => new Question(obj._id, obj.description, obj.tags, obj.answer))
      );
  }

  _getQuestionParentsPath(question: Question): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/question/parents-path/`, question);
  }
  //----------------------------------------questions------------------------------------------
  //----------------------------------------definitions----------------------------------------
  _getDefinitions(tag: string): Observable<Definition[]> {
    return this.http.get(`${this.baseUrl}/get-definitions/`, {
      params: {tag}
    }).pipe(
      map((definitions: any) => definitions.map(
        (p: Definition) => new Definition(p._id, p.name, p.value, p.tags)
      )));
  }

  _createNewDefinition(definitionObject: {name: any; value: any; tags: string[]}): Observable<Definition> {
    return this.http.post<Definition>(`${this.baseUrl}/new-definition/`, definitionObject);
  }

  _getDefinition(id: number) {
    return this.http.get<Definition>(`${this.baseUrl}/definition/${id}`)
      .pipe(
        map((obj: Definition) => new Definition(obj._id, obj.name, obj.value, obj.tags))
      );
  }

  _updateDefinition(definition: Definition): Observable<Definition> {
    return this.http.post<Definition>(`${this.baseUrl}/update-definition/`, definition)
      .pipe(
        map((obj: Definition) => new Definition(obj._id, obj.name, obj.value, obj.tags))
      );
  }

  _getDefinitionParentsPath(definition: Definition): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/definition/parents-path/`, definition);
  }

  //------------------------------------definitions----------------------------------------
  //------------------------------------actions----------------------------------------
  _getActions(tag: string) {
    return this.http.get(`${this.baseUrl}/get-actions/`, {
      params: {tag}
    }).pipe(
      map((actions: any) => actions.map(
        (a: Action) => new Action(a._id, a.name, a.value, a.tags, a.extension)
      )));
  }

  _createNewAction(actionObject: {name: any; value: any; tags: string[], extension: string}): Observable<Action> {
    return this.http.post<Action>(`${this.baseUrl}/new-action/`, actionObject);
  }

  _getAction(id: number) {
    return this.http.get<Action>(`${this.baseUrl}/action/${id}`)
      .pipe(
        map((obj: Action) => new Action(obj._id, obj.name, obj.value, obj.tags, obj.extension))
      );
  }

  _updateAction(action: Action): Observable<Action> {
    return this.http.post<Action>(`${this.baseUrl}/update-action/`, action)
      .pipe(
        map((obj: Action) => new Action(obj._id, obj.name, obj.value, obj.tags, obj.extension))
      );
  }

  _getActionParentsPath(action: Action): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/action/parents-path/`, action);
  }
  //------------------------------------actions----------------------------------------
  //------------------------------------knowledge bits start----------------------------------------
  _getKnowledgeBits(tag: string) {
    return this.http.get(`${this.baseUrl}/get-knowledge-bits/`, {
      params: {tag}
    }).pipe(
      map((knowledgeBits: any) => knowledgeBits.map(
        (a: Knowledge) => new Knowledge(a._id, a.name, a.value, a.tags, a.extension)
      )));
  }

  _createNewKnowledge(knowledgeObject: {name: any; value: any; tags: string[], extension: string}): Observable<Knowledge> {
    return this.http.post<Knowledge>(`${this.baseUrl}/new-knowledge/`, knowledgeObject);
  }

  _getKnowledge(id: number) {
    return this.http.get<Knowledge>(`${this.baseUrl}/knowledge/${id}`)
      .pipe(
        map((obj: Knowledge) => new Knowledge(obj._id, obj.name, obj.value, obj.tags, obj.extension))
      );
  }

  _updateKnowledge(knowledge: Knowledge): Observable<Knowledge> {
    return this.http.post<Knowledge>(`${this.baseUrl}/update-knowledge/`, knowledge)
      .pipe(
        map((obj: Knowledge) => new Knowledge(obj._id, obj.name, obj.value, obj.tags, obj.extension))
      );
  }

  _getKnowledgeParentsPath(knowledge: Knowledge): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/knowledge/parents-path/`, knowledge);
  }
  //------------------------------------knowledge bits end----------------------------------------
  //------------------------------------knowledge bits start----------------------------------------


  _getKnowledgeNode(id: number): Observable<KnowledgeNode> {
    return this.http.get(`${this.baseUrl}/get-knowledge-node/${id}`).pipe(
      map((obj: any) => KnowledgeNode.constructKnowledgeNode(obj))
    );
  }

  _getKnowledgeNodeParentsPath(node: KnowledgeNode): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/knowledge-node/parents-path/`, node);
  }

  _getKnowledgeNodeChildren(id: any): Observable<KnowledgeNode[]> {
    return this.http.get(`${this.baseUrl}/get-knowledge-node-children/${id}`)
      .pipe(
        map((nodes: any) => nodes.map(
          (a: any) => new KnowledgeNode(a._id, a.name, a.children)
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
}
