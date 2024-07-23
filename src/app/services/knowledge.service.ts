import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {Action} from "../models/action";
import {Knowledge} from "../models/knowledge";
import {TaskContainerDescription} from "../interfaces/types";

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  constructor(private apiService: ApiService) { }

  //----------Actions start -----------------
  getActions(ids: number[]): Observable<Action[]> {
    return this.apiService._getActions(ids);
  }

  createNewAction(actionObject: {name: any; value: any; tags: string[], extension: string}) {
    return this.apiService._createNewAction(actionObject);
  }

  getAction(id: number) {
    return this.apiService._getAction(id);
  }

  updateAction(action: Action) {
    return this.apiService._updateAction(action);
  }

  getActionParentsPath(action: Action) {
    return this.apiService._getActionParentsPath(action);
  }
  //----------Actions end -----------------
  //----------knowledge bits start -----------------

  getKnowledgeBits(ids: number[]): Observable<Knowledge[]> {
    return this.apiService._getKnowledgeBits(ids);
  }

  createNewKnowledge(knowledgeObject: {name: any; value: any; tags: string[], extension: string}) {
    return this.apiService._createNewKnowledge(knowledgeObject);
  }

  getKnowledge(id: number) {
    return this.apiService._getKnowledge(id);
  }

  updateKnowledge(knowledge: Knowledge) {
    return this.apiService._updateKnowledge(knowledge);
  }

  getKnowledgeParentsPath(knowledge: Knowledge) {
    return this.apiService._getKnowledgeParentsPath(knowledge);
  }

  //----------knowledge bits stop -----------------

}
