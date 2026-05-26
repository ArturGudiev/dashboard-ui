import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockRepetitiveTask,
  provideRouterNavigateSpy,
} from '../../../testing/test-utils';
import { RepetitiveTasksService } from '../../../services/task-container-services/repetitive-tasks.service';
import { RepetitiveTasksListComponent } from './repetitive-tasks-list.component';

describe('RepetitiveTasksListComponent', () => {
  let fixture: ComponentFixture<RepetitiveTasksListComponent>;
  let openAddRepetitiveTaskDialogSpy: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof provideRouterNavigateSpy>['navigate'];
  let confirmSpy: ReturnType<typeof vi.fn>;

  const repetitiveTasks = [
    createMockRepetitiveTask(401, 'Daily standup'),
    createMockRepetitiveTask(402, 'Weekly review'),
  ];

  beforeEach(async () => {
    confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);

    openAddRepetitiveTaskDialogSpy = vi.fn().mockReturnValue(of(undefined));
    const router = provideRouterNavigateSpy();
    navigate = router.navigate;

    await TestBed.configureTestingModule({
      imports: [RepetitiveTasksListComponent],
      providers: [
        ...router.providers,
        {
          provide: RepetitiveTasksService,
          useValue: {
            openAddRepetitiveTaskDialog: openAddRepetitiveTaskDialogSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RepetitiveTasksListComponent);
    fixture.componentRef.setInput('repetitiveTasks', repetitiveTasks);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('repetitive task navigation', () => {
    it('navigates to the repetitive-task route when a row is clicked', () => {
      const descriptionCell = fixture.debugElement.query(
        By.css('td.mat-column-description'),
      );

      descriptionCell.nativeElement.click();
      fixture.detectChanges();

      expect(navigate).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith(['repetitive-task', repetitiveTasks[0].id]);
    });
  });

  describe('add repetitive task', () => {
    it('calls openAddRepetitiveTaskDialog when the add button is clicked', () => {
      const addButton = fixture.nativeElement.querySelector(
        '#add-task-button',
      ) as HTMLButtonElement;

      addButton.click();
      fixture.detectChanges();

      expect(openAddRepetitiveTaskDialogSpy).toHaveBeenCalledOnce();
    });
  });

  describe('finish repetitive task', () => {
    it('emits itemExecutedMark when done is confirmed', () => {
      const itemExecutedMarkSpy = vi.spyOn(
        fixture.componentInstance.itemExecutedMark,
        'emit',
      );

      const doneIcon = fixture.nativeElement.querySelector(
        'td.mat-column-actions mat-icon',
      ) as HTMLElement;
      doneIcon.click();
      fixture.detectChanges();

      expect(confirmSpy).toHaveBeenCalledOnce();
      expect(itemExecutedMarkSpy).toHaveBeenCalledOnce();
      expect(itemExecutedMarkSpy).toHaveBeenCalledWith(repetitiveTasks[0]);
    });
  });
});
