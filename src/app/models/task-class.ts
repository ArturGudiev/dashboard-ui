import {TaskContainer} from '../interfaces/task-container';

export class Task implements TaskContainer {
  static readonly PREFIX = 'Task-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Task.PREFIX + '(\\d+)\\s');


  _id: number;
  description: string;
  tags: string[];
  done = false;

  constructor(_id: number,
              description: string,
              done: boolean,
              tags: string[] = []
  ) {
    this.description = description;
    this.done = done;
    this.tags = tags;
    this._id = _id;
  }

  getFullDescription(): string {
    return `${(Task.PREFIX)}${this._id} ${this.description}`
  }

}
