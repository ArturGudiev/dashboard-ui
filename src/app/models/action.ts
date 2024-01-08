import {TaskContainer} from "../interfaces/task-container";
import {TaskContainerDescription, TaskContainerType} from "../interfaces/types";
import {pick} from "lodash";

export class Action implements TaskContainer {
  static readonly prefix = 'Action-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Action.prefix + '(\\d+)\\s');
  type: TaskContainerType = 'action';
  _id: number;
  name: string;
  value: string;
  tags: string[];
  notes = '';
  extension?: string;

  tasks: number[] = [];
  problems: number[] = [];
  questions: number[] = [];
  parents: TaskContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];


  constructor(_id: number, name: string, definition: string, tags: string[],
              otherFields: any = {}) {
    this._id = _id;
    this.name = name;
    this.value = definition;
    this.tags = tags;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parents = otherFields?.parents ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }

  public getFullDescription(): string {
    return Action.prefix + this._id + ' ' + this.name;
  }

  static createFromObj(actionObj: any): Action {
    return new Action(actionObj._id, actionObj.name, actionObj.value, actionObj.tags,
      pick(actionObj, ['parents', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions'])
    )
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['action', this._id];
  }

}
