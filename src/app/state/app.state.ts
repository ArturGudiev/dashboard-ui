// app.state.ts
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { TaskC } from "../models/task-class";
import { MyAction, SetFocusedTaskForSubtasks } from "./app.actions";
import { TaskContainer } from "../interfaces/task-container";

export class ToDoProfessorStateModel {
  // Define your state properties here
  focusedTaskForSubtasks: TaskContainer | null = null;
}


@State<ToDoProfessorStateModel>({
  name: 'app',
  defaults: {
    focusedTaskForSubtasks: null
  }
})
export class AppState {

  @Action(SetFocusedTaskForSubtasks)
  setFocusedTaskForSubtasks(ctx: StateContext<ToDoProfessorStateModel>, action: SetFocusedTaskForSubtasks) {
    const state = ctx.getState();
    ctx.patchState({
      focusedTaskForSubtasks: action.task
    })
  }

  @Selector()
  static getFocusedTaskForSubtasks(state: ToDoProfessorStateModel): TaskContainer | null {
    return state.focusedTaskForSubtasks;
  }
}
