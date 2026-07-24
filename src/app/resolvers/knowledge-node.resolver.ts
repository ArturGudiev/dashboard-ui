import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { type KnowledgeNode } from '../models/knowledge-node';
import { KnowledgeNodesService } from '../services/task-container-services/knowledge-nodes.service';

export const knowledgeNodeResolver: ResolveFn<KnowledgeNode> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(KnowledgeNodesService).getKnowledgeNode(id);
};
