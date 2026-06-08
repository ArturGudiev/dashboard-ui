import { type EntLongTask } from '../../types/generated';

export function formatLongTaskProgress(
  task: Pick<EntLongTask, 'progress_done' | 'progress_total' | 'progress_units'>,
): string {
  const done = task.progress_done ?? 0;
  const total = task.progress_total ?? 0;
  const units = task.progress_units ?? '';
  let result = `${done} / ${total}${units ? ' ' + units : ''}`;
  if (units.toLowerCase() !== 'percents' && total > 0) {
    const percent = Math.round((done / total) * 100);
    result += `, ${percent}%`;
  }
  return result;
}
