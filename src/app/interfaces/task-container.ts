import {TaskContainerDescription} from "./types";

export interface ITaskContainerChildElements {
  tasks: number[]
  problems: number[]
  questions: number[]
  definitions: number[]
  knowledgeBits: number[]
  actions: number[]
  knowledgeNodes?: number[];
  // childNodes?: KnowledgeNode[];
}


export interface TaskContainer extends ITaskContainerChildElements{
  tags: string[];

  tasks: number[];
  problems: number[];
  epics?: number[];
  stories?: number[];
  parents: TaskContainerDescription[];

  // tags: string[];
  //
  // getProblems(): Problem[];
  //
  // getQuestions(): Question[];
  //
  // getTasks(): Task[];
  //
  // getAllTasks(): Task[];
  //
  getFullDescription(): string;
  getTaskContainerDescription(): TaskContainerDescription;
  notes: string;

  // interactive(): Promise<void>;
}
