import { pick } from 'lodash';
import { type TaskContainer } from './interfaces/task-container';
import { type ContainerDescription, type ContainerDescriptionSource, type TaskContainerDescription, type TaskContainerType } from './interfaces/types';
import { type ContainerVariable } from './task-class';

export type DirectionCreateSource = {
  id?: number;
  description?: string;
  tags?: string[];
  closed?: boolean;
  notes?: string;
  tasks?: number[];
  stories?: number[];
  problems?: number[];
  questions?: number[];
  longTasks?: number[];
  directions?: number[];
  parentContainers?: ContainerDescriptionSource[];
  variables?: ContainerVariable[];
};

export class Direction implements TaskContainer {
  static readonly PREFIX = 'Direction-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Direction.PREFIX + '(\\d+)\\s');
  type: TaskContainerType = 'direction';
  id: number;

  description: string;
  closed = false;
  tags: string[];
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  stories: number[] = [];
  longTasks: number[] = [];
  directions: number[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  parentContainers: ContainerDescription[] = [];
  variables: ContainerVariable[] = [];

  constructor(
    id: number,
    description: string,
    tags: string[],
    closed = false,
    notes = '',
    otherFields: {
      tasks?: number[];
      stories?: number[];
      problems?: number[];
      questions?: number[];
      longTasks?: number[];
      directions?: number[];
      parentContainers?: ContainerDescriptionSource[];
      variables?: ContainerVariable[];
    } = {},
  ) {
    this.id = id;
    this.description = description;
    this.tags = tags;
    this.notes = notes;
    this.closed = closed;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.stories = otherFields?.stories ?? [];
    this.longTasks = otherFields?.longTasks ?? [];
    this.directions = otherFields?.directions ?? [];
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.variables = otherFields?.variables ?? [];
  }

  getFullDescription(): string {
    return `${Direction.PREFIX}${this.id} ${this.description}`;
  }

  static createFromObj(directionObj: DirectionCreateSource): Direction {
    return new Direction(
      directionObj.id!,
      directionObj.description!,
      directionObj.tags ?? [],
      directionObj.closed,
      directionObj.notes,
      pick(directionObj, ['parentContainers', 'tasks', 'stories', 'problems', 'questions', 'longTasks', 'directions', 'variables']),
    );
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['direction', this.id];
  }
}
