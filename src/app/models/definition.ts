import { pick } from 'lodash';
import { type TaskContainer } from './interfaces/task-container';
import {
  type ContainerDescriptionSource,
  type ContainerDescription,
  type TaskContainerDescription,
  type TaskContainerType,
} from './interfaces/types';
import { type ContainerVariable } from './task-class';

export type DefinitionCreateSource = {
  id?: number;
  name?: string;
  value?: string;
  tags?: string[];
  notes?: string;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  stories?: number[];
  epics?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
  variables?: ContainerVariable[];
};

export class Definition implements TaskContainer {
  static readonly PREFIX = 'Definition-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Definition.PREFIX + '(\\d+)\\s');

  type: TaskContainerType = 'definition';
  id: number;
  /** Display title (API field `name`). */
  description: string;
  value: string;
  tags: string[];
  notes: string = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  stories: number[] = [];
  epics: number[] = [];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  knowledgeNodes: number[] = [];
  variables: ContainerVariable[] = [];

  constructor(
    id: number,
    description: string,
    value: string,
    tags: string[],
    notes = '',
    otherFields: {
      tasks?: number[];
      problems?: number[];
      questions?: number[];
      stories?: number[];
      epics?: number[];
      definitions?: number[];
      actions?: number[];
      knowledgeBits?: number[];
      knowledgeNodes?: number[];
      parentContainers?: ContainerDescriptionSource[];
      variables?: ContainerVariable[];
    } = {},
  ) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.tags = tags;
    this.notes = notes ?? '';
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.stories = otherFields?.stories ?? [];
    this.epics = otherFields?.epics ?? [];
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.knowledgeNodes = otherFields?.knowledgeNodes ?? [];
    this.variables = otherFields?.variables ?? [];
  }

  getFullDescription(): string {
    return `${Definition.PREFIX}${this.id} ${this.description}`;
  }

  static createFromObj(obj: DefinitionCreateSource): Definition {
    return new Definition(
      obj.id!,
      obj.name ?? '',
      obj.value ?? '',
      obj.tags ?? [],
      obj.notes,
      pick(obj, [
        'parentContainers',
        'tasks',
        'problems',
        'questions',
        'stories',
        'epics',
        'definitions',
        'knowledgeBits',
        'knowledgeNodes',
        'actions',
        'variables',
      ]),
    );
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['definition', this.id];
  }
}
