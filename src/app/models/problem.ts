import {TaskContainer} from "../interfaces/task-container";
import {TaskContainerDescription} from "../interfaces/types";
import {pick} from "lodash";

export class Problem implements TaskContainer {
  static readonly PREFIX = 'Problem-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Problem.PREFIX + '(\\d+)\\s');


  _id: number;
  description: string;
  tags: string[];
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  parents: TaskContainerDescription[];
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
                parents?: TaskContainerDescription[],
              } = {}
  ) {
    this._id = id;
    this.description = description;
    this.tags = tags;
    if (solution) {
      this.solution = solution;
    }
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parents = otherFields?.parents ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];

  }


  getFullDescription(): string {
    return `${Problem.PREFIX}${this._id} ${this.description}`
  }

  static createFromObj(obj: any): Problem {
    return new Problem(obj._id, obj.description, obj.tags, obj.solution, obj.notes,
      pick(obj, ['parents', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['problem', this._id];
  }

}
