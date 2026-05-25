import { pick } from 'lodash';
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescriptionSource, type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";

export type StoryCreateSource = {
  id?: number;
  description?: string;
  tags?: string[];
  closed?: boolean;
  notes?: string;
  tasks?: number[];
  stories?: number[];
  problems?: number[];
  questions?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
};

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
                tasks?: number[],
                stories?: number[],
                problems?: number[],
                questions?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                parentContainers?: ContainerDescriptionSource[],
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
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }

  getFullDescription(): string {
    return `${Story.PREFIX}${this.id} ${this.description}`
  }


  static createFromObj(storyObj: StoryCreateSource): Story {
    // check here object has all necessary fields
    return new Story(storyObj.id!, storyObj.description!, storyObj.tags ?? [], storyObj.closed, storyObj.notes,
      pick(storyObj, ['parentContainers', 'tasks', 'stories', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['story', this.id];
  }


}
