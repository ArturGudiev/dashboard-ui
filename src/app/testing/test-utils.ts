import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { type Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { TaskC } from '../models/task-class';
import type { TaskContainer } from '../models/interfaces/task-container';

export function provideMatDialogTest(data: unknown = {}): Array<{ provide: unknown; useValue: unknown }> {
  return [
    {
      provide: MatDialogRef,
      useValue: {
        close: vi.fn(),
        afterClosed: () => of(undefined),
      },
    },
    { provide: MAT_DIALOG_DATA, useValue: data },
  ];
}

export function createMockTaskContainer(): TaskC {
  return TaskC.createFromObj({
    id: 1,
    description: 'test task',
    done: false,
    tasks: [],
    problems: [],
    questions: [],
  });
}

export function emptyIdListRefresh(): () => Observable<number[]> {
  return () => of([]);
}

export function setRequiredTaskContainerInputs(
  fixture: { componentRef: { setInput: (name: string, value: unknown) => void } },
  container: TaskContainer = createMockTaskContainer(),
): void {
  fixture.componentRef.setInput('taskContainer', container);
  fixture.componentRef.setInput('parentsPath', []);
  fixture.componentRef.setInput('refreshTasks$', emptyIdListRefresh());
  fixture.componentRef.setInput('refreshProblems$', emptyIdListRefresh());
  fixture.componentRef.setInput('refreshQuestions$', emptyIdListRefresh());
}
