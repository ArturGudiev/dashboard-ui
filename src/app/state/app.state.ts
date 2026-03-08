// app.state.ts
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetDisabledHotkeys, SetFocusedTaskForSubtasks } from "./app.actions";
import { TaskContainer } from "../models/interfaces/task-container";

export class TaskManagerStateModel {
  focusedTaskForSubtasks: TaskContainer | null = null;
  disabledHotkeys = false
}


@State<TaskManagerStateModel>({
  name: 'app',
  defaults: {
    focusedTaskForSubtasks: null,
    disabledHotkeys: false,
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
    const state = ctx.getState();
    ctx.patchState({ disabledHotkeys: action.disabledHotkeys });
  }

  @Selector()
  static getFocusedTaskForSubtasks(state: TaskManagerStateModel): TaskContainer | null {
    return state.focusedTaskForSubtasks;
  }

  @Selector()
  static getDisabledHotkeys(state: TaskManagerStateModel): boolean {
    return state.disabledHotkeys;
  }
}
