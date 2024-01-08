import {TaskContainer} from "../interfaces/task-container";
import {TaskContainerDescription, TaskContainerType} from "../interfaces/types";

export class Definition implements TaskContainer {
  static readonly prefix = 'Definition-';
  type: TaskContainerType = 'definition';
  _id: number;

  name: string;
  value: string;
  tags: string[];
  notes = '';

  tasks: number[];
  problems: number[];
  questions: number[];
  parents: TaskContainerDescription[];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];


  constructor(_id: number, name: string, value: string, tags: string[],
              otherFields: {
                tasks?: any,
                problems?: any,
                questions?: any,
                definitions?: any,
                actions?: any,
                knowledgeBits?: any,
                parents?: TaskContainerDescription[],
              } = {}) {
    this._id = _id;
    this.name = name;
    this.value = value;
    this.tags = tags;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parents = otherFields?.parents ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }

  getFullDescription() {
    return Definition.prefix + this._id + ' ' + this.name;
  }

  static createFromObj(obj: any): Definition {
    return new Definition(obj._id, obj.name, obj.value, obj.tags, obj.notes)
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['definition', this._id];
  }

}
