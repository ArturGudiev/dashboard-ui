import {TaskContainer} from "../interfaces/task-container";

export class Action implements TaskContainer {
  static readonly prefix = 'Action-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Action.prefix + '(\\d+)\\s');

  _id: number;
  name: string;
  value: string;
  tags: string[];
  extension: string;
  notes: string;

  constructor(_id: number, name: string, value: string, tags: string[], extension: string) {
    this._id = _id;
    this.name = name;
    this.value = value;
    this.tags = tags;
    this.extension = extension;
  }

  public getFullDescription(): string {
    return Action.prefix + this._id + ' ' + this.name;
  }
}
