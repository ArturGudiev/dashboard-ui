import { Injectable } from '@angular/core';
import {TaskContainer} from "../interfaces/task-container";
import {Observable} from "rxjs";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class TaskContainerService {

  constructor(private apiService: ApiService) { }

  getParentsPath(taskContainer: TaskContainer): Observable<string[]> {
    return this.apiService._getParentsPath(taskContainer);
  }

}
