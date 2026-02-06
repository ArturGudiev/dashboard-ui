import { pick } from 'lodash';
import { TaskContainer } from "./interfaces/task-container";
import { ContainerDescription, TaskContainerDescription, TaskContainerType } from "./interfaces/types";

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
                tasks?: any,
                problems?: any,
                questions?: any,
                definitions?: any,
                actions?: any,
                knowledgeBits?: any,
                parentContainers?: ContainerDescription[],
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
    this.parentContainers = otherFields?.parentContainers ?? [];
    this.actions = otherFields?.actions ?? [];
    this.definitions = otherFields?.definitions ?? [];
    this.knowledgeBits = otherFields?.knowledgeBits ?? [];
  }


  getFullDescription(): string {
    return `${Question.QUESTION}${this.id} ${this.description}`
  }

  static createFromObj(obj: any): Question {
    return new Question(obj.id, obj.description, obj.tags, obj.answer, obj.notes,
      pick(obj, ['parentContainers', 'tasks', 'problems', 'questions',
        'definitions', 'knowledgeBits', 'knowledgeNodes', 'actions']))
  }

  getTaskContainerDescription(): TaskContainerDescription {
    return ['question', this.id];
  }

}
