import {TaskContainerDescription, TaskContainerType} from "./types";

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
  _id: number;
  tags: string[];
  tasks: number[];
  problems: number[];
  epics?: number[];
  stories?: number[];
  parents: TaskContainerDescription[];

  getFullDescription(): string;
  getTaskContainerDescription(): TaskContainerDescription;
  type: TaskContainerType;
  notes: string;

}
