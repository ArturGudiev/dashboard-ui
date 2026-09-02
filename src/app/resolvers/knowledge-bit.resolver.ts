import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { type Knowledge } from '../models/knowledge';
import { KnowledgeService } from '../services/task-container-services/knowledge.service';

export const knowledgeBitResolver: ResolveFn<Knowledge> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(KnowledgeService).getKnowledge(id);
};
