import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {Definition} from "../models/definition";
import {Action} from "../models/action";

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  constructor(private apiService: ApiService) { }

  getDefinitions(tag: string): Observable<Definition[]> {
    return this.apiService._getDefinitions(tag);
  }

  createNewDefinition(definitionObject: { name: any; value: any; tags: string[] }): Observable<Definition> {
    return this.apiService._createNewDefinition(definitionObject);
  }

  getActions(tag: string): Observable<Action[]> {
    return this.apiService._getActions(tag);
  }

  createNewAction(actionObject: {name: any; value: any; tags: string[]}) {
    return this.apiService._createNewAction(actionObject);
  }

  getAction(id: number) {
    return this.apiService._getAction(id);
  }

  updateAction(action: Action) {
    return this.apiService._updateAction(action);
  }

  getParentsPath(action: Action) {
    return this.apiService._getActionParentsPath(action);
  }
}
