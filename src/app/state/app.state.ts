// app.state.ts
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { TaskC } from "../models/task-class";
import { MyAction, SetFocusedTaskForSubtasks } from "./app.actions";
import { TaskContainer } from "../interfaces/task-container";

export class ToDoProfessorStateModel {
  // Define your state properties here
  x: number
  focusedTaskForSubtasks: TaskContainer | null
}


@State<ToDoProfessorStateModel>({
  name: 'app',
  defaults: {
    x: 0,
    focusedTaskForSubtasks: null
  }
})
export class AppState {

  @Action(MyAction)
  myAction(ctx: StateContext<ToDoProfessorStateModel>, action: MyAction) {
    const state = ctx.getState();
    ctx.patchState({
      x: state.x + 1
    })
  }

  @Action(SetFocusedTaskForSubtasks)
  setFocusedTaskForSubtasks(ctx: StateContext<ToDoProfessorStateModel>, action: SetFocusedTaskForSubtasks) {
    const state = ctx.getState();
    ctx.patchState({
      focusedTaskForSubtasks: action.task
    })
  }




  @Selector()
  static getX(state: ToDoProfessorStateModel): number {
    return state.x;
  }

  @Selector()
  static getFocusedTaskForSubtasks(state: ToDoProfessorStateModel): TaskContainer | null {
    return state.focusedTaskForSubtasks;
  }
}
