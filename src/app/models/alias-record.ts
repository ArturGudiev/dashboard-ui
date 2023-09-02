export interface AliasesRecordInterface {
  aliases: string[];
  destination: string;
  description?: string;

}


export class AliasesRecord implements AliasesRecordInterface{
  aliases: string[];
  destination: string;
  description?: string;
  path?: string;

  constructor(obj: any) {
    this.aliases = obj.aliases;
    this.destination = obj.destination;
    if (obj.description) {
      this.description = obj.description;
    }
    if (obj.path) {
      this.path = obj.path;
    }

  }

}
