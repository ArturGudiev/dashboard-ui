import {TaskContainer} from "../interfaces/task-container";

export class Definition implements TaskContainer {
  static readonly prefix = 'Definition-';

  _id: number;
  name: string;
  value: string;
  tags: string[];
  notes: string;

  constructor(_id: number, name: string, definition: string, tags: string[]) {
    this._id = _id;
    this.name = name;
    this.value = definition;
    this.tags = tags;
  }

  getFullDescription() {
    return Definition.prefix + this._id + ' ' + this.name;
  }

}
