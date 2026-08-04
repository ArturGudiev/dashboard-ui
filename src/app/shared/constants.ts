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
export const  NEW_TASK_DIALOG_OPTIONS = { height: '460px', width: '700px'};
export const  NEW_HIERARCHICAL_TASK_DIALOG_OPTIONS = { height: '600px', width: '800px'};
export const  NEW_STORY_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  NEW_EPIC_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  GET_VALUE_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  VARIABLE_DIALOG_OPTIONS = { height: '300px', width: '700px'};
export const  ALIASES_DIALOG_OPTIONS = {
  width: '560px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  autoFocus: 'first-tabbable' as const,
};
export const SELECT_MULTIPLE_DIALOG_OPTIONS = {
  width: '560px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  autoFocus: 'first-tabbable' as const,
};
export const SCRIPT_EDIT_DIALOG_OPTIONS = {
  width: '720px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  autoFocus: 'first-tabbable' as const,
};
export const RUN_SCRIPT_DIALOG_OPTIONS = {
  width: '720px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  autoFocus: 'first-tabbable' as const,
};

export const AFTER_TASK_TAG = 'after-task';

export const isAfterTask = (task: { tags?: string[] | null }): boolean => {
  return (task.tags ?? []).includes(AFTER_TASK_TAG);
};

export const isTask = (container: TaskContainer): container is TaskC => {
  return container.type === "task";
}
