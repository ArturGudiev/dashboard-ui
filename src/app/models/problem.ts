import {TaskContainer} from "../interfaces/task-container";

export class Problem implements TaskContainer {
  static readonly PREFIX = 'Problem-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Problem.PREFIX + '(\\d+)\\s');


  _id: number;
  description: string;
  tags: string[];
  solution?: string;
  notes: string;


  constructor(id: number, description: string, tags: string[], solution?: string) {
    this._id = id;
    this.description = description;
    this.tags = tags;
    if (solution) {
      this.solution = solution;
    }
  }

  getFullDescription(): string {
    return `${Problem.PREFIX}${this._id} ${this.description}`
  }

}
