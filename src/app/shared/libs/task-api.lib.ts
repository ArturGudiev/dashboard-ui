import { TaskC, type ContainerCheck, type ContainerVariable, type TaskCCreateSource } from '../../models/task-class';
import {
  type EntTask,
  type HandlersTaskResponse,
  type ModelsContainerCheck,
  type ModelsContainerVariable,
  type ModelsTaskFull,
} from '../../types/generated';

/** PUT /finish-tasks-by-ids and PUT /finish-tasks — handler returns `{}`. */
export type EmptyJsonResponse = Record<string, never>;

/** PUT /update-task body — matches Go `models.TaskPartial`. */
export interface UpdateTaskBody {
  id: number;
  description?: string;
  notes?: string;
  tags?: string[];
  done?: boolean;
}

export function isTaskCCreateSource(value: unknown): value is TaskCCreateSource {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as TaskCCreateSource;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.description === 'string' &&
    typeof candidate.done === 'boolean'
  );
}

function toContainerVariables(variables?: ModelsContainerVariable[]): ContainerVariable[] {
  return (variables ?? []).map((variable) => {
    const { id, variableName, variableValue } = variable;
    if (id == null || variableName == null || variableValue == null) {
      throw new Error('Invalid container variable payload from API');
    }
    return { id, variableName, variableValue };
  });
}

function toContainerChecks(checks?: ModelsContainerCheck[]): ContainerCheck[] {
  return (checks ?? []).map((check) => {
    const { id, description, containerType, containerID } = check;
    if (id == null || description == null) {
      throw new Error('Invalid container check payload from API');
    }
    return { id, description, containerType, containerID };
  });
}

function toTaskCCreateSource(dto: {
  id?: number;
  description?: string;
  done?: boolean;
  tags?: string[];
  notes?: string;
  dueDateTime?: string | null;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  definitions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  actions?: number[];
  parentContainers?: TaskCCreateSource['parentContainers'];
  variables?: ModelsContainerVariable[];
  checks?: ModelsContainerCheck[];
}): TaskCCreateSource {
  const { id, description, done } = dto;
  if (id == null || description == null || done == null) {
    throw new Error('Invalid task payload from API');
  }
  return {
    id,
    description,
    done,
    tags: dto.tags ?? [],
    notes: dto.notes ?? '',
    dueDateTime: dto.dueDateTime ?? null,
    tasks: dto.tasks,
    problems: dto.problems,
    questions: dto.questions,
    definitions: dto.definitions,
    knowledgeBits: dto.knowledgeBits,
    knowledgeNodes: dto.knowledgeNodes,
    actions: dto.actions,
    parentContainers: dto.parentContainers,
    variables: toContainerVariables(dto.variables),
    checks: toContainerChecks(dto.checks),
  };
}

/** GET /task/:id, POST /new-task, PUT /update-task — Go `models.TaskFull`. */
export function taskFromFull(dto: ModelsTaskFull): TaskC {
  return TaskC.createFromObj(toTaskCCreateSource(dto));
}

/** PUT /add-anonymous-task/:count, POST /new-task (swagger) — Go `ent.Task` JSON. */
export function taskFromEnt(dto: EntTask): TaskC {
  return TaskC.createFromObj(toTaskCCreateSource(dto));
}

/** PUT /finish-task/:id — Go `handlers.TaskResponse` (subset of fields in practice). */
export function taskFromFinishResponse(dto: HandlersTaskResponse): TaskC {
  return TaskC.createFromObj(
    toTaskCCreateSource({
      id: dto.id,
      description: dto.description,
      done: dto.done,
      tags: dto.tags,
      notes: dto.notes,
      problems: dto.problems,
      questions: dto.questions,
      actions: dto.actions,
      definitions: dto.definitions,
      knowledgeBits: dto.knowledge_bits,
      knowledgeNodes: dto.knowledge_nodes,
    }),
  );
}

export function toUpdateTaskBody(task: TaskC): UpdateTaskBody {
  return {
    id: task.id,
    description: task.description,
    notes: task.notes,
    tags: task.tags,
    done: task.done,
  };
}
