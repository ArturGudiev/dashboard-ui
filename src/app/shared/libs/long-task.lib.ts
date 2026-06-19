import {
  ModelsLongTaskFull,
  ModelsLongTaskProgress,
  ModelsLongTaskProgressSubmission,
  type EntLongTask,
  type EntLongTaskProgress,
} from '../../types/generated';

export function hasNumericProgress(
  task: Pick<EntLongTask, 'progress_total'>,
): boolean {
  return task.progress_total != null;
}

export function hasNumericProgressForProgress(
  progress: Pick<ModelsLongTaskProgress, 'total'>,
): boolean {
  return progress.total != null;
}

export function toModelsLongTaskProgress(
  progress: EntLongTaskProgress,
): ModelsLongTaskProgress {
  return {
    id: progress.id!,
    name: progress.name ?? '',
    value: progress.value,
    total: progress.total,
    units: progress.units,
  };
}

function legacyProgressesFromTask(task: EntLongTask): ModelsLongTaskProgress[] {
  if (task.progress_total == null) {
    return [];
  }

  return [{
    id: 0,
    name: 'Progress',
    value: task.progress_done ?? 0,
    total: task.progress_total,
    units: task.progress_units,
  }];
}

export function toModelsLongTaskFull(
  task: EntLongTask,
  progresses?: EntLongTaskProgress[],
): ModelsLongTaskFull {
  const mappedProgresses = progresses?.map(toModelsLongTaskProgress) ?? [];

  return {
    id: task.id,
    description: task.description,
    done: task.done,
    doneDateTime: task.done_date_time,
    notes: task.notes,
    tags: task.tags ?? [],
    progresses: mappedProgresses.length > 0 ? mappedProgresses : legacyProgressesFromTask(task),
  };
}

export function formatLongTaskProgress(
  task: Pick<ModelsLongTaskFull, 'progresses'>,
): string {
  if (!task.progresses?.length) {
    return '—';
  }

  return task.progresses.map(formatLongTaskSingleProgress).join(', ');
}


export function getLongTaskProgressName(
  progresses: ModelsLongTaskProgress[] | undefined,
  longTaskProgressId: number | undefined,
): string {
  if (longTaskProgressId == null || !progresses?.length) {
    return '—';
  }

  return progresses.find((progress) => progress.id === longTaskProgressId)?.name ?? '—';
}

export function formatLongTaskProgressSubmission(
  submission: Pick<ModelsLongTaskProgressSubmission, 'progressRaw' | 'progressToAdd' | 'progressToSet'>,
): string {
  if (submission.progressRaw != null) {
    return String(submission.progressRaw);
  }
  if (submission.progressToSet != null) {
    return `set to ${submission.progressToSet}`;
  }
  if (submission.progressToAdd != null) {
    return `+${submission.progressToAdd}`;
  }
  return '—';
}

function formatProgressPercentage(value: number, total: number): string | null {
  if (total === 0) {
    return null;
  }
  return `${((value / total) * 100).toFixed(2)}%`;
}

export function formatLongTaskSingleProgress(
  progress: ModelsLongTaskProgress,
): string {
  if (progress.total == null || progress.value == null) {
    return '—';
  }

  const done = progress.value;
  const total = progress.total;
  const units = progress.units ?? '';
  const main = `${done} / ${total}${units ? ' ' + units : ''}`;
  const percent = formatProgressPercentage(done, total);
  return percent != null ? `${main} (${percent})` : main;
}
