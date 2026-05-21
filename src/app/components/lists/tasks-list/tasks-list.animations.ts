import { animate, style, transition, trigger } from '@angular/animations';

/** Soft crossfade when the task id list changes (reload / add task). */
export const tasksListRefreshAnimation = trigger('tasksListRefresh', [
  transition('* => *', [
    style({ opacity: 0.35 }),
    animate('220ms ease-out', style({ opacity: 1 })),
  ]),
]);
