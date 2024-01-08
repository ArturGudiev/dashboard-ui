import {TaskContainer} from "../interfaces/task-container";
import {TaskContainerDescription, TaskContainerType} from "../interfaces/types";
import {pick} from "lodash";

export class KnowledgeNode implements TaskContainer {
  static readonly PREFIX = 'KnowledgeNode-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + KnowledgeNode.PREFIX + '(\\d+)\\s');
  type: TaskContainerType = 'knowledge-node';
  _id: number;
  name: string;
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  parents: TaskContainerDescription[];
  knowledgeNodes: number[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  tags: string[] = [];

  constructor(id: number, name: string,
              otherFields: {
                knowledgeNodes?: any,
                tasks?: any,
                problems?: any,
                questions?: any,
                definitions?: any,
                actions?: any,
                knowledgeBits?: any,
                parents?: TaskContainerDescription[],
              } = {}
  ) {
    this._id = id;
    this.name = name;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parents = otherFields?.parents ?? [];
    this.knowledgeNodes = otherFields?.knowledgeNodes ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }


  // static constructKnowledgeNode(obj: any): KnowledgeNode {
  //   const children = obj.children.map((nodeObj: any) => KnowledgeNode.constructKnowledgeNode(nodeObj));
  //   return new KnowledgeNode(obj._id, obj.name, children);
  // }

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

  static createFromObj(obj: KnowledgeNode): KnowledgeNode {
    return new KnowledgeNode(obj._id, obj.name,
      pick(obj, ['parents', 'knowledgeNodes', 'tasks', 'problems',
        'questions', 'definitions', 'knowledgeBits', 'actions']));
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['knowledge-node', this._id];
  }


}
