import { pick } from 'lodash';
import { type TaskContainer } from './interfaces/task-container';
import {
  type ContainerDescriptionSource,
  type ContainerDescription,
  type TaskContainerDescription,
  type TaskContainerType,
} from './interfaces/types';
import { type ContainerVariable } from './task-class';

export type KnowledgeNodeCreateSource = {
  id?: number;
  name?: string;
  description?: string;
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

export class KnowledgeNode implements TaskContainer {
  static readonly PREFIX = 'KnowledgeNode-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + KnowledgeNode.PREFIX + '(\\d+)\\s');

  type: TaskContainerType = 'knowledge-node';
  id: number;
  /** Display title (API field `name`). */
  description: string;
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
    return `${KnowledgeNode.PREFIX}${this.id} ${this.description}`;
  }

  static createFromObj(obj: KnowledgeNodeCreateSource): KnowledgeNode {
    const title = obj.name ?? obj.description ?? '';
    return new KnowledgeNode(obj.id!, title, obj.tags ?? [], obj.notes, pick(obj, [
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
    ]));
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['knowledge-node', this.id];
  }
}
