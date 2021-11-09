export class Action {
  static readonly prefix = 'Action-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Action.prefix + '(\\d+)\\s');

  _id: number;
  name: string;
  value: string;
  tags: string[];


  constructor(_id: number, name: string, value: string, tags: string[]) {
    this._id = _id;
    this.name = name;
    this.value = value;
    this.tags = tags;
  }

  public getFullDescription(): string {
    return Action.prefix + this._id + ' ' + this.name;
  }
}
