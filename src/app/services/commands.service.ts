import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

export interface CommandsStateInterface {
  command: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandsService {

  private initialState: CommandsStateInterface = {
    command: ''
  }
  private data = new BehaviorSubject(this.initialState);

  constructor() { }


  getDataCurrentState(): CommandsStateInterface {
    return this.data.getValue();
  }

  setDataState(state: CommandsStateInterface): void {
    this.data.next(state);
  }

  setCommand(command: string): void {
    const state = this.getDataCurrentState();
    this.setDataState({...state, command});
  }

  getDataStateChange(): Observable<CommandsStateInterface> {
    return this.data.asObservable();
  }
}
