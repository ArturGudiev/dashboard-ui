import { TaskC, type TaskCCreateSource } from '../../models/task-class';
import {
  type EntTask,
  type HandlersTaskResponse,
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

function toTaskCCreateSource(dto: {
  id?: number;
  description?: string;
  done?: boolean;
  tags?: string[];
  notes?: string;
  tasks?: number[];
  problems?: number[];
  questions?: number[];
  definitions?: number[];
  knowledgeBits?: number[];
  knowledgeNodes?: number[];
  actions?: number[];
  parentContainers?: TaskCCreateSource['parentContainers'];
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
    tasks: dto.tasks,
    problems: dto.problems,
    questions: dto.questions,
    definitions: dto.definitions,
    knowledgeBits: dto.knowledgeBits,
    knowledgeNodes: dto.knowledgeNodes,
    actions: dto.actions,
    parentContainers: dto.parentContainers,
  };
}

/** GET /task/:id, POST /new-task, PUT /update-task — Go `models.TaskFull`. */
export function taskFromFull(dto: ModelsTaskFull): TaskC {
  return TaskC.createFromObj(toTaskCCreateSource(dto));
}

/** PUT /add-anonymous-task, POST /new-task (swagger) — Go `ent.Task` JSON. */
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
