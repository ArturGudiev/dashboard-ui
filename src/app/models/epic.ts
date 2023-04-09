import {TaskContainer} from "../interfaces/task-container";

export class Epic implements TaskContainer{
  static readonly PREFIX = 'EPIC-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Epic.PREFIX + '(\\d+)\\s');


  _id: number;
  description: string;
  active: boolean;
  closed = false;
  tags: string[];
  notes: string;

  constructor(id: number, description: string, tags: string[], active: boolean, closed = false) {
    this._id = id;
    this.description = description;
    this.active = active;
    this.closed = closed;
    this.tags = tags;
  }

  getFullDescription(): string {
    return `${Epic.PREFIX}${this._id} ${this.description}`
  }

}


