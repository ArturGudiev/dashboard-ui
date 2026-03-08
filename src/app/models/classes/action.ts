import { pick } from "lodash";
import { TaskContainer } from "../interfaces/task-container";
import { ContainerDescription, TaskContainerDescription, TaskContainerType } from "../interfaces/types";

export class Action implements TaskContainer {
  static readonly prefix = 'Action-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Action.prefix + '(\\d+)\\s');
  type: TaskContainerType = 'action';
  id: number;
  name: string;
  value: string;
  tags: string[];
  notes = '';
  extension?: string;

  tasks: number[] = [];
  problems: number[] = [];
  questions: number[] = [];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];


  constructor(_id: number, name: string, definition: string, tags: string[],
              otherFields: any = {}) {
    this.id = _id;
    this.name = name;
    this.value = definition;
    this.tags = tags;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parentContainers = otherFields?.parentContainers ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }

  public getFullDescription(): string {
    return Action.prefix + this.id + ' ' + this.name;
  }

  static createFromObj(actionObj: any): Action {
    return new Action(actionObj.id, actionObj.name, actionObj.value, actionObj.tags,
      pick(actionObj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions'])
    )
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['action', this.id];
  }

}
