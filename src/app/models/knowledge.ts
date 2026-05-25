import { pick } from "lodash";
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";

export class Knowledge implements TaskContainer {
  static readonly prefix = 'Knowledge-';
  type: TaskContainerType = 'knowledge-bit';
  id: number;
  name: string;
  value: string;
  tags: string[]
  extension?: string;
  notes = '';
  tasks: number[];
  problems: number[];
  questions: number[];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];


  constructor(id: number, name: string, value: string, tags: string[], extension?: string,
              otherFields: {
                tasks?: number[],
                problems?: number[],
                questions?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                parentContainers?: ContainerDescription[],
              } = {}
  ) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.tags = tags;
    if (extension) {
      this.extension = extension;
    }
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parentContainers = otherFields?.parentContainers ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }


  public getFullDescription(): string {
    return Knowledge.prefix + this.id + ' ' + this.name;
  }

  static createFromObj(obj: Knowledge): Knowledge {
    
    return new Knowledge(obj.id, obj.name, obj.value, obj.tags, obj.extension,
      pick(obj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['knowledge-bit', this.id];
  }

}
