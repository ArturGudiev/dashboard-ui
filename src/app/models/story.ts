import { pick } from 'lodash';
import { TaskContainer } from "./interfaces/task-container";
import { ContainerDescription, TaskContainerDescription, TaskContainerType } from "./interfaces/types";

export class Story implements TaskContainer {
  static readonly PREFIX = 'Story-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Story.PREFIX + '(\\d+)\\s');
  type: TaskContainerType = 'story';
  id: number;

  description: string;
  closed = false;
  tags: string[];
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  stories: number[] = [];
  parentContainers: ContainerDescription[] = [];


  constructor(id: number, description: string, tags: string[], closed = false,
              notes = '',
              otherFields: {
                tasks?: any,
                stories?: any,
                problems?: any,
                questions?: any,
                definitions?: any,
                actions?: any,
                knowledgeBits?: any,
                parentContainers?: ContainerDescription[],
              } = {}) {
    this.id = id;
    this.description = description;
    this.tags = tags;
    this.notes = notes;
    this.closed = closed;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.stories = otherFields?.stories ?? [];
    this.parentContainers = otherFields?.parentContainers ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }

  getFullDescription(): string {
    return `${Story.PREFIX}${this.id} ${this.description}`
  }


  static createFromObj(storyObj: any): Story {
    // check here object has all necessary fields
    return new Story(storyObj.id, storyObj.description, storyObj.tags, storyObj.closed, storyObj.notes,
      pick(storyObj, ['parentContainers', 'tasks', 'stories', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['story', this.id];
  }


}
