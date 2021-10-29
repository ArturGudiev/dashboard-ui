import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";

export interface CommandsStateInterface {
  command: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandsService {

  private data = new Subject<CommandsStateInterface>();
  constructor() { }

  setDataState(state: CommandsStateInterface): void {
    this.data.next(state);
  }

  setCommand(command: string): void {
    this.setDataState({command});
  }

  getDataStateChange(): Observable<CommandsStateInterface> {
    return this.data.asObservable();
  }
}
