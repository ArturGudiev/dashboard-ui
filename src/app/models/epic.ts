import { pick } from "lodash";
import { TaskContainer } from "./interfaces/task-container";
import { TaskContainerDescription, TaskContainerType } from "./interfaces/types";

export class Epic implements TaskContainer{
  static readonly PREFIX = 'Epic-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Epic.PREFIX + '(\\d+)\\s');

  type: TaskContainerType = 'epic';

  _id: number;
  description: string;
  closed = false;
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  stories: number[] = [];
  epics: number[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  parents: TaskContainerDescription[];
  tags: string[];

  constructor(id: number, description: string, tags: string[], closed = false, notes = '',
              otherFields: {
                tasks?: any,
                stories?: any,
                epics?: any,
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
    this.closed = closed;
    this.tags = tags;
    this.notes = notes;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.stories = otherFields?.stories ?? [];
    this.epics = otherFields?.epics ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.parents = otherFields?.parents ?? [];
  }

  getFullDescription(): string {
    return `${Epic.PREFIX}${this._id} ${this.description}`
  }

  static createFromObj(epicObj: any): Epic {
    // check here object has all necessary fields
    return new Epic(epicObj._id, epicObj.description, epicObj.tags, epicObj.closed, epicObj.notes,
      pick(epicObj, ['parents', 'epics', 'tasks', 'stories', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['epic', this._id];
  }

}


