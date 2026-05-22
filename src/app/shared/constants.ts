import { type TaskC } from "../models/task-class";
import { type TaskContainer } from "../models/interfaces/task-container";

export const sapphireBlue = '#0F52BA'
export const colorBlue = '#6497b1'
export const colorPink = '#FF8080'
export const colorYellow = '#FFFFC0'
export const colorLightBrown = '#FFC080'
export const colorLightPink = '#8080C0'

export const COLORS = [colorBlue, colorPink, colorYellow, colorLightBrown, colorLightPink];

export const  NEW_QUESTION_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  NEW_TASK_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  NEW_STORY_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  GET_VALUE_DIALOG_OPTIONS = { height: '300px', width: '700px'};

export const isTask = (container: TaskContainer): container is TaskC => {
  return container.type === "task";
}
