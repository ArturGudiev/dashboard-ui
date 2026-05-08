import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IAlertsDataState {
  message: string;
  closed: boolean;
  type: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private initialState: IAlertsDataState = {
    message: '',
    type: 'info',
    closed: true,
    duration: 5000
  };
  data$ = new BehaviorSubject(this.initialState);

  getDataCurrentState(): IAlertsDataState {
    return this.data$.getValue();
  }

  setDataState(state: IAlertsDataState): void {
    this.data$.next(state);
  }

  showAlert(message: string, duration = 3000, type = 'info'): void {
    const state = this.getDataCurrentState();
    this.setDataState({...state, message, type, closed: false, duration});
  }

  setAlertClosed(): void {
    const state = this.getDataCurrentState();
    this.setDataState({...state, closed: true});
  }
}
