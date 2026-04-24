// app.state.ts
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetDisabledHotkeys, SetDoneTaskFromDate, SetFocusedTaskForSubtasks } from "./app.actions";
import { TaskContainer } from "../models/interfaces/task-container";

export class TaskManagerStateModel {
  focusedTaskForSubtasks: TaskContainer | null = null;
  disabledHotkeys = false;
  doneTaskFromDate: string | null = null
}


@State<TaskManagerStateModel>({
  name: 'app',
  defaults: {
    focusedTaskForSubtasks: null,
    disabledHotkeys: false,
    doneTaskFromDate: null,
  }
})
export class AppState {

  @Action(SetFocusedTaskForSubtasks)
  setFocusedTaskForSubtasks(ctx: StateContext<TaskManagerStateModel>, action: SetFocusedTaskForSubtasks) {
    const state = ctx.getState();
    ctx.patchState({
      focusedTaskForSubtasks: action.task
    })
  }

  @Action(SetDisabledHotkeys)
  setDisabledHotkeys(ctx: StateContext<TaskManagerStateModel>, action: SetDisabledHotkeys) {
    ctx.patchState({ disabledHotkeys: action.disabledHotkeys });
  }

  @Action(SetDoneTaskFromDate)
  setDoneTaskFromDate(ctx: StateContext<TaskManagerStateModel>, action: SetDoneTaskFromDate) {
    ctx.patchState({ doneTaskFromDate: action.doneTaskFromDate });
  }

  @Selector()
  static getFocusedTaskForSubtasks(state: TaskManagerStateModel): TaskContainer | null {
    return state.focusedTaskForSubtasks;
  }

  @Selector()
  static getDisabledHotkeys(state: TaskManagerStateModel): boolean {
    return state.disabledHotkeys;
  }

  @Selector()
  static getDoneTaskFromDate(state: TaskManagerStateModel): string | null {
    return state.doneTaskFromDate;
  }
}
