import { TaskC } from '../../models/task-class';
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

/** GET /task/:id, POST /new-task, PUT /update-task — Go `models.TaskFull`. */
export function taskFromFull(dto: ModelsTaskFull): TaskC {
  return TaskC.createFromObj(dto);
}

/** PUT /add-anonymous-task, POST /new-task (swagger) — Go `ent.Task` JSON. */
export function taskFromEnt(dto: EntTask): TaskC {
  return TaskC.createFromObj(dto);
}

/** PUT /finish-task/:id — Go `handlers.TaskResponse` (subset of fields in practice). */
export function taskFromFinishResponse(dto: HandlersTaskResponse): TaskC {
  return TaskC.createFromObj(dto);
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
