import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { ApiService } from "./api.service";
import { AppState } from "../state/app.state";
import { Store } from "@ngxs/store";

export interface DashboardStateInterface {
  doneTasks: number;
  doneTasksUntilValue: number;
  showUntilValue: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private initialState: DashboardStateInterface = {
    doneTasks: 0,
    doneTasksUntilValue: 0,
    showUntilValue: false,
  }
  private data = new BehaviorSubject(this.initialState);

  constructor(
    private tasksApiService: ApiService,
    private store: Store,
  ) {
  }

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

  async updateDoneTasksNumber() {
    this.store.select(AppState.getDoneTaskFromDate).subscribe(from => {
        this.tasksApiService._getDoneTasksNumber(from).subscribe((res: any) => {
          if (typeof res.doneTasks == 'number') {
            this.setDoneTasks(res.doneTasks);
          }
        })
      }
    );
  }

  setDoneTasksUntilValue(doneTasksUntilValue: number) {
    const state = this.getDataCurrentState();
    this.setDataState({...state, doneTasksUntilValue, showUntilValue: true});
  }

  disableShowUntilValue() {
    const state = this.getDataCurrentState();
    this.setDataState({...state, showUntilValue: false});
  }

}
