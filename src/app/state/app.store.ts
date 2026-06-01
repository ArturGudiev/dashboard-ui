import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { type TaskContainer } from '../models/interfaces/task-container';
import { ContainerVariable } from "../models/task-class";

interface AppState {
  focusedTaskForSubtasks: TaskContainer | null;
  disabledHotkeys: boolean;
  doneTaskFromDate: string | null;
  variablesStack: ContainerVariable[] | null;
}

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<AppState>({
    focusedTaskForSubtasks: null,
    disabledHotkeys: false,
    doneTaskFromDate: null,
    variablesStack: null,
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

    setVariablesStack(variablesStack: ContainerVariable[]): void {
      patchState(store, { variablesStack });
    },
  })),
);
