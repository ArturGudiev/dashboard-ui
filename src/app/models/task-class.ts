import {TaskContainer} from '../interfaces/task-container';
import {TaskContainerDescription, TaskContainerType} from "../interfaces/types";
import {pick} from "lodash";
import {KnowledgeNode} from "./knowledge-node";

export class TaskC implements TaskContainer {
  static readonly PREFIX = 'Task-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + TaskC.PREFIX + '(\\d+)\\s');
  type: TaskContainerType = 'task';
  _id: number;
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
  parents: TaskContainerDescription[] = [];
  knowledgeNodes: number[] = [];

  constructor(_id: number,
              description: string,
              done: boolean,
              tags: string[] = [],
              notes = '',
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
    this.description = description;
    this.done = done;
    this.tags = tags;
    this._id = _id;
    this.notes = notes;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.actions = otherFields?.actions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.parents = otherFields?.parents ?? [];

  }

  getFullDescription(): string {
    return `${(TaskC.PREFIX)}${this._id} ${this.description}`
  }

  static createFromObj(taskObj: any): TaskC {
    // check here object has all necessary fields
    return new TaskC(taskObj._id, taskObj.description, taskObj.done, taskObj.tags, taskObj.notes,
      pick(taskObj, ['parents', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['task', this._id];
  }

}
