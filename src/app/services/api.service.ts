import {Injectable} from '@angular/core';
import {TaskC} from '../models/task-class';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Epic} from "../models/epic";
import {TaskContainer} from "../interfaces/task-container";
import {Story} from "../models/story";
import {Problem} from "../models/problem";
import {Question} from "../models/question";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = 'http://192.168.1.62:3000'

  constructor(private http: HttpClient) {
  }


  _getTask(id: number): Observable<TaskC> {
    return this.http.get<TaskC>(`${this.baseUrl}/task/${id}`)
      .pipe(
        map((obj) => new TaskC(obj._id, obj.description, obj.done, obj.tags))
      );
  }

  _getParentsPath(obj: TaskContainer): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/task/parents-path/`, obj);
  }

  _getTasks(tag: string): Observable<TaskC[]> {
    return this.http.get(`${this.baseUrl}/get-tasks/`, {
      params: {tag}
    }).pipe(
      map((tasks: any) => tasks.map((t: TaskC) => new TaskC(t._id, t.description, t.done, t.tags))
      ));
  }

  _createNewTask(obj: { description: any; tags: string[] }): Observable<TaskC> {
    return this.http.post<TaskC>(`${this.baseUrl}/new-task/`, obj);
  }

  _finishTask(task: TaskC): Observable<any> {
    return this.http.put(`${this.baseUrl}/finish-task/${task._id}`, {});
  }

  _finishTasks(tasks: TaskC[]) {
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
  //------------------------------------problems-------------------------------------------------
  //------------------------------------questions----------------------------------------
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
  //------------------------------------questions----------------------------------------


}
