
export type TaskContainerType = 'epic' | 'story' | 'task' | 'question' | 'problem' | 'knowledge-node' | 'knowledge-bit'
  | 'definition' | 'action' | 'scheduled-task';

export function isTaskContainerType(type: string): type is TaskContainerType {
  if ( ['epic','story','task','question','problem','knowledge-node','knowledge-bit','definition','action', 'scheduled-task'].includes(type) ) {
    return true;
  }
  return false;
}

export const taskContainerDescriptionAreEqual = (d1: TaskContainerDescription, d2: TaskContainerDescription) => {
  return d1[0] === d2[0] && d1[1] === d2[1];
}

export type TaskContainerDescription = [TaskContainerType, number]
