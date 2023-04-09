import {TaskContainer} from "../interfaces/task-container";

export class Question implements TaskContainer {
  static readonly QUESTION = 'Question-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Question.QUESTION + '(\\d+)\\s');

  _id: number;
  description: string;
  tags: string[];
  answer?: string;
  notes: string;

  constructor(id: number, description: string, tags: string[], answer?: string) {
    this._id = id;
    this.description = description;
    this.tags = tags;
    if(answer) {
      this.answer = answer;
    }
  }

  getFullDescription(): string {
    return `${Question.QUESTION}${this._id} ${this.description}`
  }

}
