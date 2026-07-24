import {TaskC} from '../../models/task-class';
import {Epic} from "../../models/epic";
import {Story} from "../../models/story";
import {Problem} from "../../models/problem";
import {Question} from "../../models/question";
import {KnowledgeNode} from "../../models/knowledge-node";
import {Direction} from "../../models/direction";

export const isTaskDescription = (description: string): boolean => TaskC.DESCRIPTION_REGEX.test(description);
export const isEpicDescription = (description: string): boolean => Epic.DESCRIPTION_REGEX.test(description);
export const isProblemDescription = (description: string): boolean => Problem.DESCRIPTION_REGEX.test(description);
export const isQuestionDescription = (description: string): boolean => Question.DESCRIPTION_REGEX.test(description);
export const isStoryDescription = (description: string): boolean => Story.DESCRIPTION_REGEX.test(description);
export const isKnowledgeNodeDescription = (description: string): boolean => KnowledgeNode.DESCRIPTION_REGEX.test(description);
export const LONG_TASK_DESCRIPTION_REGEX = /^LongTask-(\d+)\s/;
export const isLongTaskDescription = (description: string): boolean => LONG_TASK_DESCRIPTION_REGEX.test(description);
export const isDirectionDescription = (description: string): boolean => Direction.DESCRIPTION_REGEX.test(description);

export function getUrlByDescription(description: string): string[] {
  if (isTaskDescription(description)) {
    const arr = TaskC.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['task', arr[1]];
    }
  }
  if (isEpicDescription(description)) {
    const arr = Epic.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['epic', arr[1]];
    }
  }
  if (isStoryDescription(description)) {
    const arr = Story.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['story', arr[1]];
    }
  }
  if (isProblemDescription(description)) {
    const arr = Problem.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['problem', arr[1]];
    }
  }
  if (isQuestionDescription(description)) {
    const arr = Question.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['question', arr[1]];
    }
  }
  if (isKnowledgeNodeDescription(description)) {
    const arr = KnowledgeNode.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['knowledge-node', arr[1]];
    }
  }
  if (isLongTaskDescription(description)) {
    const arr = LONG_TASK_DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['long-task', arr[1]];
    }
  }
  if (isDirectionDescription(description)) {
    const arr = Direction.DESCRIPTION_REGEX.exec(description);
    if (arr && arr.length > 1) {
      return ['direction', arr[1]];
    }
  }
  return [];
}
