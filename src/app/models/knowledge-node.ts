import {TaskContainer} from "../interfaces/task-container";

export class KnowledgeNode implements TaskContainer{
  static readonly PREFIX = 'KnowledgeNode-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + KnowledgeNode.PREFIX + '(\\d+)\\s');

  _id: number;
  name: string;
  children: KnowledgeNode[];

  constructor(id: number, name: string, children: KnowledgeNode[]) {
    this._id = id;
    this.name = name;
    this.children = children;
  }

  static constructKnowledgeNode(obj: any): KnowledgeNode {
    const children = obj.children.map((nodeObj: any) => KnowledgeNode.constructKnowledgeNode(nodeObj));
    return new KnowledgeNode(obj._id, obj.name, children);
  }

  public getFullDescription(): string {
    return KnowledgeNode.PREFIX + this._id + ' ' + this.name;
  }

  public isEqual(knowledgeNode: KnowledgeNode): boolean {
    return this._id === knowledgeNode._id && this.name === knowledgeNode.name;
  }

  // static createKnowledgeNode(node: any): KnowledgeNode {
  //   let children: KnowledgeNode[] = [];
  //   if (node.children && node.children.length > 0) {
  //     children = node.children.map( (child: any) => this.createKnowledgeNode(child));
  //   }
  //   return new KnowledgeNode(node._id, node.name, children);
  // }

  // static async createKnowledgeNodeInteractively(): Promise<KnowledgeNode | null> {
  //   const name = await getUserInput('Enter name');
  //   if (name === '') {
  //     return null;
  //   }
  //   return new KnowledgeNode(this.getNextKnowledgeNodeId(), name, []);
  // }
  //
  // private static getNextKnowledgeNodeId() {
  //   const meta = getJSONFileContent(metaFile);
  //   const id = ++meta.knowledgeNodeId;
  //   writeFileContent(metaFile, meta);
  //   return id;
  // }
}
