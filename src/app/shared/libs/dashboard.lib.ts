import {TaskC} from '../../models/taskClass';

export const isTaskDescription = (description: string): boolean => TaskC.DESCRIPTION_REGEX.test(description);
// export const isProblemDescription = (description: string): boolean => Problem.DESCRIPTION_REGEX.test(description);
// export const isQuestionDescription = (description: string): boolean => Question.DESCRIPTION_REGEX.test(description);
// export const isStoryDescription = (description: string): boolean => Story.DESCRIPTION_REGEX.test(description);
// export const isEpicDescription = (description: string): boolean => Epic.DESCRIPTION_REGEX.test(description);
