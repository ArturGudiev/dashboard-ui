import { pick } from "lodash";
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescription, type ContainerDescriptionSource, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";
import { type ContainerVariable } from "./task-class";

export type KnowledgeCreateSource = {
  id?: number;
  name?: string;
  value?: string;
  tags?: string[];
  extension?: string;
  notes?: string;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  stories?: number[];
  epics?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
  variables?: ContainerVariable[];
};

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
  stories: number[] = [];
  epics: number[] = [];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];
  knowledgeNodes: number[] = [];
  variables: ContainerVariable[] = [];


  constructor(id: number, name: string, value: string, tags: string[], extension?: string,
              otherFields: {
                tasks?: number[],
                problems?: number[],
                questions?: number[],
                stories?: number[],
                epics?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                knowledgeNodes?: number[],
                parentContainers?: ContainerDescriptionSource[],
                variables?: ContainerVariable[],
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
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
    this.knowledgeNodes = otherFields?.knowledgeNodes ?? [];
    this.variables = otherFields?.variables ?? [];
  }


  public getFullDescription(): string {
    return Knowledge.prefix + this.id + ' ' + this.name;
  }

  static createFromObj(obj: KnowledgeCreateSource): Knowledge {
    return new Knowledge(obj.id!, obj.name ?? '', obj.value ?? '', obj.tags ?? [], obj.extension,
      pick(obj, ['parentContainers', 'tasks', 'problems', 'questions', 'stories', 'epics',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions', 'variables', 'notes']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['knowledge-bit', this.id];
  }

}
