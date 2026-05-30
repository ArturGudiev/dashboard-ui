import { pick } from "lodash";
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescriptionSource, type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";
import { type ContainerVariable } from "./task-class";

export type ProblemCreateSource = {
  id?: number;
  description?: string;
  tags?: string[];
  solution?: string;
  notes?: string;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
  variables?: ContainerVariable[];
};

export class Problem implements TaskContainer {
  static readonly PREFIX = 'Problem-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Problem.PREFIX + '(\\d+)\\s');

  type: TaskContainerType = 'problem';
  id: number;
  description: string;
  tags: string[];
  notes: string = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  stories: number[] = [];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  variables: ContainerVariable[] = [];


  solution?: string;

  constructor(id: number, description: string, tags: string[], solution?: string, notes = '',
              otherFields: {
                tasks?: number[],
                problems?: number[],
                questions?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                parentContainers?: ContainerDescriptionSource[],
                variables?: ContainerVariable[],
              } = {}
  ) {
    this.id = id;
    this.description = description;
    this.tags = tags;
    this.notes = notes ?? '';
    if (solution) {
      this.solution = solution;
    }
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.variables = otherFields?.variables ?? [];

  }


  getFullDescription(): string {
    return `${Problem.PREFIX}${this.id} ${this.description}`
  }

  static createFromObj(obj: ProblemCreateSource): Problem {
    return new Problem(obj.id!, obj.description!, obj.tags ?? [], obj.solution, obj.notes,
      pick(obj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions', 'variables']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['problem', this.id];
  }

}
