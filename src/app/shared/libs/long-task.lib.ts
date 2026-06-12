import { type EntLongTask } from '../../types/generated';

export function hasNumericProgress(
  task: Pick<EntLongTask, 'progress_total'>,
): boolean {
  return task.progress_total != null;
}

function formatPercent(value: number): string {
  return String(parseFloat(value.toFixed(2)));
}

export function formatLongTaskProgress(
  task: Pick<EntLongTask, 'progress_done' | 'progress_total' | 'progress_units'>,
): string {
  if (task.progress_total == null) {
    return '—';
  }

  const done = task.progress_done ?? 0;
  const total = task.progress_total;
  const units = task.progress_units ?? '';
  let result = `${done} / ${total}${units ? ' ' + units : ''}`;
  if (total > 0) {
    result += `, ${formatPercent((done / total) * 100)}%`;
  }
  return result;
}
