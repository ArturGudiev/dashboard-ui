import {TaskContainer} from "../interfaces/task-container";

export class Knowledge implements TaskContainer{
  static readonly prefix = 'Knowledge-';

  _id: number;
  name: string;
  value: string;
  tags: string[]
  extension?: string;
  notes: string;

  constructor(id: number, name: string, value: string, tags: string[], extension?: string) {
    this._id = id;
    this.name = name;
    this.value = value;
    this.tags = tags;
    if(extension) {
      this.extension = extension;
    }
  }

  public getFullDescription(): string {
    return Knowledge.prefix + this._id + ' ' + this.name;
  }
}
