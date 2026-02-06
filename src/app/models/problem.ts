import { pick } from "lodash";
import { TaskContainer } from "./interfaces/task-container";
import { ContainerDescription, TaskContainerDescription, TaskContainerType } from "./interfaces/types";

export class Problem implements TaskContainer {
  static readonly PREFIX = 'Problem-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Problem.PREFIX + '(\\d+)\\s');

  type: TaskContainerType = 'problem';
  id: number;
  description: string;
  tags: string[];
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  stories: number[] = [];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];


  solution?: string;

  constructor(id: number, description: string, tags: string[], solution?: string, notes?: '',
              otherFields: {
                tasks?: any,
                problems?: any,
                questions?: any,
                definitions?: any,
                actions?: any,
                knowledgeBits?: any,
                parentContainers?: ContainerDescription[],
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
    this.parentContainers = otherFields?.parentContainers ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];

  }


  getFullDescription(): string {
    return `${Problem.PREFIX}${this.id} ${this.description}`
  }

  static createFromObj(obj: any): Problem {
    return new Problem(obj.id, obj.description, obj.tags, obj.solution, obj.notes,
      pick(obj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['problem', this.id];
  }

}
