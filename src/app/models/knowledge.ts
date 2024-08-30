import { pick } from "lodash";
import { TaskContainer } from "./interfaces/task-container";
import { TaskContainerDescription, TaskContainerType } from "./interfaces/types";

export class Knowledge implements TaskContainer {
  static readonly prefix = 'Knowledge-';
  type: TaskContainerType = 'knowledge-bit';
  _id: number;
  name: string;
  value: string;
  tags: string[]
  extension?: string;
  notes = ''; // TODO do we need it?
  tasks: number[];
  problems: number[];
  questions: number[];
  parents: TaskContainerDescription[];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];


  constructor(id: number, name: string, value: string, tags: string[], extension?: string,
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
    this.name = name;
    this.value = value;
    this.tags = tags;
    if (extension) {
      this.extension = extension;
    }
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parents = otherFields?.parents ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }


  public getFullDescription(): string {
    return Knowledge.prefix + this._id + ' ' + this.name;
  }

  static createFromObj(obj: any): Knowledge {
    // check here object has all necessary fields
    return new Knowledge(obj._id, obj.name, obj.value, obj.tags, obj.extension,
      pick(obj, ['parents', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['knowledge-bit', this._id];
  }

}
