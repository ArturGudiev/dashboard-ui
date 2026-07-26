import { pick } from 'lodash';
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescriptionSource, type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";

export type ContainerVariable = {
  id: number;
  variableName: string;
  variableValue: string;
};

export type ContainerCheck = {
  id: number;
  description: string;
  containerType?: string;
  containerID?: number;
};

export type TaskCCreateSource = {
  id: number;
  description: string;
  done: boolean;
  tags?: string[];
  notes?: string;
  dueDateTime?: string | null;
  tasks?: number[];
  problems?: number[];  
  questions?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
  variables?: ContainerVariable[];
  checks?: ContainerCheck[];
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
  dueDateTime: string | null = null;
  tasks: number[];
  problems: number[];
  questions: number[];
  actions: number[];
  definitions: number[];
  knowledgeBits: number[];
  parentContainers: ContainerDescription[] = [];
  knowledgeNodes: number[] = [];
  variables: ContainerVariable[] = [];
  checks: ContainerCheck[] = [];

  constructor(_id: number,
              description: string,
              done: boolean,
              tags: string[] = [],
              notes = '',
              otherFields: {
                dueDateTime?: string | null,
                tasks?: number[],
                problems?: number[],
                questions?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                parentContainers?: ContainerDescriptionSource[],
                variables?: ContainerVariable[],
                checks?: ContainerCheck[],
              } = {}
  ) {
    this.description = description;
    this.done = done;
    this.tags = tags;
    this.id = _id;
    this.notes = notes;
    this.dueDateTime = otherFields?.dueDateTime ?? null;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.actions = otherFields?.actions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.variables = otherFields?.variables ?? [];
    this.checks = otherFields?.checks ?? [];
  }

  getFullDescription(): string {
    return `${(TaskC.PREFIX)}${this.id} ${this.description}`
  }

  static createFromObj(taskObj: TaskCCreateSource): TaskC {
    return new TaskC(taskObj.id, taskObj.description, taskObj.done, taskObj.tags, taskObj.notes,
      pick(taskObj, ['dueDateTime', 'parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions', 'variables', 'checks']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['task', this.id];
  }

}
