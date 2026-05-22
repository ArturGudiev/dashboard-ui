import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { type TaskContainer } from '../models/interfaces/task-container';

interface AppState {
  focusedTaskForSubtasks: TaskContainer | null;
  disabledHotkeys: boolean;
  doneTaskFromDate: string | null;
}

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<AppState>({
    focusedTaskForSubtasks: null,
    disabledHotkeys: false,
    doneTaskFromDate: null,
  }),
  withMethods((store) => ({
    setFocusedTaskForSubtasks(task: TaskContainer): void {
      patchState(store, { focusedTaskForSubtasks: task });
    },
    setDisabledHotkeys(disabledHotkeys: boolean): void {
      patchState(store, { disabledHotkeys });
    },
    setDoneTaskFromDate(doneTaskFromDate: string | null): void {
      patchState(store, { doneTaskFromDate });
    },
  })),
);
