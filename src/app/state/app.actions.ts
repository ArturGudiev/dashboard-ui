import { TaskContainer } from "../models/interfaces/task-container";

export class MyAction {
  static readonly type = 'MyAction'

  constructor() {

  }
}

export class SetFocusedTaskForSubtasks {
  static readonly type = 'Set Focused Task For Subtasks'
  constructor(public task: TaskContainer) { }
}

export class SetDisabledHotkeys {
  static readonly type = 'Set Disabled Hotkeys'
  constructor(public disabledHotkeys: boolean) { }
}
