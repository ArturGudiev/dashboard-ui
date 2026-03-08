import { ContainerDescription, TaskContainerDescription, TaskContainerType } from "./types";

export interface ITaskContainerChildElements {
  tasks: number[]
  problems: number[]
  questions: number[]
  definitions: number[]
  knowledgeBits: number[]
  actions: number[]
  knowledgeNodes?: number[];
}


export interface TaskContainer extends ITaskContainerChildElements{
  id: number;
  tags: string[];
  tasks: number[];
  problems: number[];
  epics?: number[];
  stories?: number[];
  // parents: TaskContainerDescription[];
  parentContainers: ContainerDescription[];

  getFullDescription(): string;
  getTaskContainerDescription(): TaskContainerDescription;
  type: TaskContainerType;
  notes: string;
}
