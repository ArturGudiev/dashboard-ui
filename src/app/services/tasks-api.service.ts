import {Injectable} from '@angular/core';
import {TaskC} from '../models/taskClass';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TasksApiService {
  baseUrl = 'http://192.168.1.62'
  constructor(private http: HttpClient) {
  }


  _getTask(id: number): Observable<TaskC> {
    return this.http.get<TaskC>(`${this.baseUrl}:3000/task/${id}`)
      .pipe(
      map((obj) => new TaskC(obj._id, obj.description, obj.done, obj.tags))
    );
  }

  _getParentsPath(task: TaskC): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}:3000/task/parents-path/`, task);
  }

  _getTasks(tag: string): Observable<TaskC[]> {
    return this.http.get(`${this.baseUrl}:3000/get-tasks/`, {
      params: {tag}
    }).pipe(
      map((tasks: any) => tasks.map((t: TaskC) => new TaskC(t._id, t.description, t.done, t.tags))
      ));
  }

  _createNewTask(obj: { description: any; tags: string[] }): Observable<TaskC> {
    return this.http.post<TaskC>(`${this.baseUrl}:3000/new-task/`, obj);
  }

  _finishTask(task: TaskC): Observable<any> {
    return this.http.put(`${this.baseUrl}:3000/finish-task/${task._id}`, {});
  }

  _finishTasks(tasks: TaskC[]) {
    return this.http.put(`${this.baseUrl}:3000/finish-tasks/`, tasks).pipe(

    );
  }

  _getDoneTasksNumber() {
    // return this.http.get(`${this.baseUrl}:3000/done-tasks-number/`);
    return this.http.get(`${this.baseUrl}:3000/done-tasks/`);
  }
}
