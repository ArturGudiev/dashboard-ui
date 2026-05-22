import { inject, Injectable } from '@angular/core';
import { type Observable } from "rxjs";
import { ApiService } from "../api.service";
import { type Knowledge } from "../../models/knowledge";

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  private apiService = inject(ApiService);

  //----------Actions start -----------------

  createNewAction(actionObject: {name: any; value: any; tags: string[], extension: string}) {
    return this.apiService._createNewAction(actionObject);
  }

  getAction(id: number) {
    return this.apiService._getAction(id);
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

  //----------knowledge bits stop -----------------

}
