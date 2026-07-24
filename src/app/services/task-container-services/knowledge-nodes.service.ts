import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { KnowledgeNode } from '../../models/knowledge-node';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeNodesService {
  private apiService = inject(ApiService);

  getKnowledgeNode(id: number): Observable<KnowledgeNode> {
    return this.apiService._getKnowledgeNode(id);
  }

  getKnowledgeNodes(ids: number[]): Observable<KnowledgeNode[]> {
    return this.apiService._getKnowledgeNodes(ids);
  }

  updateKnowledgeNode(node: KnowledgeNode): Observable<KnowledgeNode> {
    return this.apiService.updateKnowledgeNode(node);
  }
}
