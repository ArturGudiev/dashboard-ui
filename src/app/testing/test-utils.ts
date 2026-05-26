import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { type Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { Epic } from '../models/epic';
import { Problem } from '../models/problem';
import { Question } from '../models/question';
import { Story } from '../models/story';
import { TaskC } from '../models/task-class';
import type { TaskContainer } from '../models/interfaces/task-container';
import type { ModelsRepetitiveTaskResponse } from '../types/generated';

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

export function provideRouterNavigateSpy() {
  const navigate = vi.fn().mockResolvedValue(true);
  return {
    navigate,
    providers: [{ provide: Router, useValue: { navigate } }],
  };
}

export function createMockEpic(id: number, description: string): Epic {
  return new Epic(id, description, [], false, '', {
    tasks: [],
    problems: [],
    questions: [],
    stories: [],
    epics: [],
  });
}

export function createMockProblem(id: number, description: string): Problem {
  return Problem.createFromObj({
    id,
    description,
    tags: [],
    tasks: [],
    problems: [],
    questions: [],
  });
}

export function createMockQuestion(id: number, description: string): Question {
  return Question.createFromObj({
    id,
    description,
    tags: [],
    tasks: [],
    problems: [],
    questions: [],
  });
}

export function createMockStory(id: number, description: string): Story {
  return Story.createFromObj({
    id,
    description,
    tags: [],
    tasks: [],
    problems: [],
    questions: [],
  });
}

export function createMockRepetitiveTask(
  id: number,
  description: string,
): ModelsRepetitiveTaskResponse {
  return { id, description };
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
