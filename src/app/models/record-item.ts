
export class RecordItem {
  _id: number;
  message: string;
  date: string;
  tags: string[];


  constructor(id: number, message: string,
              date: string, tags: string[]) {
    this.message = message;
    this._id = id;
    this.date = date;
    this.tags = tags;
  }

  static createRecordsItemFromObj(obj: any): RecordItem {
    return new RecordItem(obj._id, obj.message, obj.date, obj.tags)
  }
}
