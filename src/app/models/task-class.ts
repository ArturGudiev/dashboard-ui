import {TaskContainer} from '../interfaces/task-container';

export class TaskC implements TaskContainer {
  static readonly PREFIX = 'Task-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + TaskC.PREFIX + '(\\d+)\\s');


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
    return `${(TaskC.PREFIX)}${this._id} ${this.description}`
  }

}
