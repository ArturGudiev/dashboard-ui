import { pick } from 'lodash';
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescriptionSource, type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";

export type TaskCCreateSource = {
  id: number;
  description: string;
  done: boolean;
  tags?: string[];
  notes?: string;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
};

export class TaskC implements TaskContainer {
  static readonly PREFIX = 'Task-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + TaskC.PREFIX + '(\\d+)\\s');
  type: TaskContainerType = 'task';
  id: number;
  description: string;
  tags: string[];
  done = false;

  notes: string;
  tasks: number[];
  problems: number[];
  questions: number[];
  actions: number[];
  definitions: number[];
  knowledgeBits: number[];
  parentContainers: ContainerDescription[] = [];
  knowledgeNodes: number[] = [];

  constructor(_id: number,
              description: string,
              done: boolean,
              tags: string[] = [],
              notes = '',
              otherFields: {
                tasks?: number[],
                problems?: number[],
                questions?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                parentContainers?: ContainerDescriptionSource[],
              } = {}
  ) {
    this.description = description;
    this.done = done;
    this.tags = tags;
    this.id = _id;
    this.notes = notes;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.actions = otherFields?.actions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
  }

  getFullDescription(): string {
    return `${(TaskC.PREFIX)}${this.id} ${this.description}`
  }

  static createFromObj(taskObj: TaskCCreateSource): TaskC {
    // check here object has all necessary fields
    return new TaskC(taskObj.id, taskObj.description, taskObj.done, taskObj.tags, taskObj.notes,
      pick(taskObj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['task', this.id];
  }

}
