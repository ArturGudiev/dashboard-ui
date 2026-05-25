import { pick } from 'lodash';
import { type TaskContainer } from "./interfaces/task-container";
import { type ContainerDescriptionSource, type ContainerDescription, type TaskContainerDescription, type TaskContainerType } from "./interfaces/types";

export type QuestionCreateSource = {
  id?: number;
  description?: string;
  tags?: string[];
  answer?: string;
  notes?: string;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  definitions?: number[];
  actions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  parentContainers?: ContainerDescriptionSource[];
};

export class Question implements TaskContainer {
  static readonly QUESTION = 'Question-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Question.QUESTION + '(\\d+)\\s');
  type: TaskContainerType = 'question';
  id: number;
  description: string;
  tags: string[];
  notes = '';
  answer?: string;
  tasks: number[];
  problems: number[];
  questions: number[];
  parentContainers: ContainerDescription[] = [];
  actions: number[] = [];
  definitions: number[] = [];
  knowledgeBits: number[] = [];

  constructor(id: number, description: string, tags: string[],
              answer?: string, notes = '',
              otherFields: {
                tasks?: number[],
                problems?: number[],
                questions?: number[],
                definitions?: number[],
                actions?: number[],
                knowledgeBits?: number[],
                parentContainers?: ContainerDescriptionSource[],
              } = {}
  ) {
    this.id = id;
    this.description = description;
    this.tags = tags;
    if(answer) {
      this.answer = answer;
    }
    this.notes = notes;
    this.tasks = otherFields?.tasks ?? [];
    this.problems = otherFields?.problems ?? [];
    this.questions = otherFields?.questions ?? [];
    this.parentContainers = (otherFields?.parentContainers ?? []) as ContainerDescription[];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }


  getFullDescription(): string {
    return `${Question.QUESTION}${this.id} ${this.description}`
  }

  static createFromObj(obj: QuestionCreateSource): Question {
    return new Question(obj.id!, obj.description!, obj.tags ?? [], obj.answer, obj.notes,
      pick(obj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['question', this.id];
  }

}
