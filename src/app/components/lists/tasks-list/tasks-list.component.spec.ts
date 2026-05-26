import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EMPTY, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskC } from '../../../models/task-class';
import { createMockTaskContainer } from '../../../testing/test-utils';
import { CommandsService } from '../../../services/commands.service';
import { NavigationService } from '../../../services/navigation.service';
import { TasksService } from '../../../services/task-container-services/tasks.service';
import { TaskContainerService } from '../../../services/task-container-services/task-container.service';
import { TasksListComponent } from './tasks-list.component';

function createSubtask(id: number, description: string): TaskC {
  return TaskC.createFromObj({
    id,
    description,
    done: false,
    tasks: [],
  });
}

describe('TasksListComponent', () => {
  let fixture: ComponentFixture<TasksListComponent>;
  let finishTasksSpy: ReturnType<typeof vi.fn>;
  let openAddTaskDialogSpy: ReturnType<typeof vi.fn>;
  let navigateToTaskSpy: ReturnType<typeof vi.fn>;

  const container = createMockTaskContainer();
  const subtasks = [
    createSubtask(101, 'First subtask'),
    createSubtask(102, 'Second subtask'),
  ];

  beforeEach(async () => {
    finishTasksSpy = vi.fn().mockReturnValue(of(undefined));
    openAddTaskDialogSpy = vi.fn().mockReturnValue(of(undefined));
    navigateToTaskSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [TasksListComponent],
      providers: [
        {
          provide: TasksService,
          useValue: {
            finishTasks: finishTasksSpy,
            openAddTaskDialog: openAddTaskDialogSpy,
            addTaskDialogOpened: false,
          },
        },
        {
          provide: NavigationService,
          useValue: {
            navigateToTask: navigateToTaskSpy,
          },
        },
        {
          provide: CommandsService,
          useValue: {
            getDataStateChange: () => EMPTY,
          },
        },
        {
          provide: TaskContainerService,
          useValue: {
            refreshSubtasks$: EMPTY,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksListComponent);
    fixture.componentRef.setInput('container', container);
    fixture.componentRef.setInput('tasks', subtasks);
    fixture.detectChanges();
  });

  describe('finish all tasks', () => {
    it('calls finishTasks with current subtasks when finish-all is clicked', () => {
      const finishAllButton = fixture.nativeElement.querySelector(
        'button.finish-tasks-button',
      ) as HTMLButtonElement;

      finishAllButton.click();
      fixture.detectChanges();

      expect(finishTasksSpy).toHaveBeenCalledOnce();
      expect(finishTasksSpy).toHaveBeenCalledWith(subtasks);
    });
  });

  describe('subtask navigation', () => {
    it('navigates to the task route when a subtask row is clicked', () => {
      const descriptionCell = fixture.debugElement.query(
        By.css('td.mat-column-description'),
      );

      descriptionCell.nativeElement.click();
      fixture.detectChanges();

      expect(navigateToTaskSpy).toHaveBeenCalledOnce();
      expect(navigateToTaskSpy).toHaveBeenCalledWith(subtasks[0].id);
    });
  });

  describe('add task', () => {
    it('calls openAddTaskDialog when the add button is clicked', () => {
      const addButton = fixture.nativeElement.querySelector(
        '#add-task-button',
      ) as HTMLButtonElement;

      addButton.click();
      fixture.detectChanges();

      expect(openAddTaskDialogSpy).toHaveBeenCalledOnce();
    });
  });
});
