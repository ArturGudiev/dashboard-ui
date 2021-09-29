import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {TasksApiService} from "./tasks-api.service";

export interface DashboardStateInterface {
  doneTasks: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private initialState: DashboardStateInterface = {
    doneTasks: 0
  }
  private data = new BehaviorSubject(this.initialState);
  constructor(private tasksApiService: TasksApiService) { }

  getDataCurrentState(): DashboardStateInterface {
    return this.data.getValue();
  }

  setDataState(state: DashboardStateInterface): void {
    this.data.next(state);
  }

  getDataStateChange(): Observable<DashboardStateInterface> {
    return this.data.asObservable();
  }

  setDoneTasks(doneTasks: number): void {
    const state = this.getDataCurrentState();
    this.setDataState({...state, doneTasks});
  }

  updateDoneTasksNumber() {
    this.tasksApiService._getDoneTasksNumber().subscribe((res: any) => {
      if (typeof res.doneTasks == 'number' ) {
        this.setDoneTasks(res.doneTasks);
      }
    })
  }
}
