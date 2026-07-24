import { type Epic } from '../../models/epic';
import { type KnowledgeNode } from '../../models/knowledge-node';
import { type Problem } from '../../models/problem';
import { type Question } from '../../models/question';
import { type Story } from '../../models/story';

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

export function toKnowledgeNodePartial(node: KnowledgeNode) {
  return {
    id: node.id,
    name: node.description,
    notes: node.notes,
    tags: node.tags,
  };
}
