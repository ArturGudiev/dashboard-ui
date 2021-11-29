import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {Definition} from "../models/definition";
import {Action} from "../models/action";
import {Knowledge} from "../models/knowledge";
import {KnowledgeNode} from "../models/knowledge-node";

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  constructor(private apiService: ApiService) { }

  //----------Definitions start -----------------
  getDefinitions(tag: string): Observable<Definition[]> {
    return this.apiService._getDefinitions(tag);
  }

  createNewDefinition(definitionObject: { name: any; value: any; tags: string[] }): Observable<Definition> {
    return this.apiService._createNewDefinition(definitionObject);
  }

  getDefinition(id: number) {
    return this.apiService._getDefinition(id);
  }

  updateDefinition(definition: Definition) {
    return this.apiService._updateDefinition(definition);
  }

  getDefinitionParentsPath(definition: Definition) {
    return this.apiService._getDefinitionParentsPath(definition);
  }
  //----------Definitions end -----------------
  //----------Actions start -----------------
  getActions(tag: string): Observable<Action[]> {
    return this.apiService._getActions(tag);
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

  getKnowledgeBits(tag: string): Observable<Knowledge[]> {
    return this.apiService._getKnowledgeBits(tag);
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
  //----------knowledge tree start -----------------
  getKnowledgeNode(id: number): Observable<KnowledgeNode> {
    return this.apiService._getKnowledgeNode(id);
  }
  getKnowledgeNodeParentsPath(node: KnowledgeNode) {
    return this.apiService._getKnowledgeNodeParentsPath(node);
  }

  getKnowledgeNodeChildren(id: any) {
    return this.apiService._getKnowledgeNodeChildren(id);
  }

  createNewChildKnowledgeNode(obj: { name: string; id: number }): Observable<any> {
    return this.apiService._createNewKnowledgeNode(obj);
  }
  deleteKnowledgeNode(node: KnowledgeNode): Observable<any> {
    return this.apiService._deleteKnowledgeNode(node);

  }
  //----------knowledge tree start -----------------
}
