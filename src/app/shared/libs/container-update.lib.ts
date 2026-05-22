import { Epic } from '../../models/epic';
import { Problem } from '../../models/problem';
import { Question } from '../../models/question';
import { Story } from '../../models/story';

/** Fields accepted by PUT /update-epic, /update-story, etc. */
export function toEpicPartial(epic: Epic) {
  return {
    id: epic.id,
    description: epic.description,
    notes: epic.notes,
    tags: epic.tags,
  };
}

export function toStoryPartial(story: Story) {
  return {
    id: story.id,
    description: story.description,
    notes: story.notes,
    tags: story.tags,
  };
}

export function toProblemPartial(problem: Problem) {
  return {
    id: problem.id,
    description: problem.description,
    notes: problem.notes,
    tags: problem.tags,
    ...(problem.solution !== undefined ? { solution: problem.solution } : {}),
  };
}

export function toQuestionPartial(question: Question) {
  return {
    id: question.id,
    description: question.description,
    notes: question.notes,
    tags: question.tags,
    ...(question.answer !== undefined ? { answer: question.answer } : {}),
  };
}
