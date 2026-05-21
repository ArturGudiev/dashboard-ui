import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Question } from '../models/question';
import { QuestionsService } from '../services/task-container-services/questions.service';

export const questionResolver: ResolveFn<Question> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(QuestionsService).getQuestion(id);
};
