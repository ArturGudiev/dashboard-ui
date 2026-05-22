import { pick } from "lodash";
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";

export class Epic implements TaskContainer{
  static readonly PREFIX = 'Epic-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Epic.PREFIX + '(\\d+)\\s');

  type: TaskContainerType = 'epic';

  id: number;
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
  parentContainers: ContainerDescription[] = [];
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
                parentContainers?: ContainerDescription[],
              } = {}
  ) {
    this.id = id;
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
    this.parentContainers = otherFields?.parentContainers ?? [];
  }

  getFullDescription(): string {
    return `${Epic.PREFIX}${this.id} ${this.description}`
  }

  static createFromObj(epicObj: any): Epic {
    return new Epic(epicObj.id, epicObj.description, epicObj.tags, epicObj.closed, epicObj.notes,
      pick(epicObj, ['parentContainers', 'epics', 'tasks', 'stories', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['epic', this.id];
  }

}


