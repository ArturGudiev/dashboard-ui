import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EMPTY, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockProblem,
  createMockTaskContainer,
  provideRouterNavigateSpy,
} from '../../../testing/test-utils';
import { CommandsService } from '../../../services/commands.service';
import { ProblemsService } from '../../../services/task-container-services/problems.service';
import { ProblemsListComponent } from './problems-list.component';

describe('ProblemsListComponent', () => {
  let fixture: ComponentFixture<ProblemsListComponent>;
  let finishProblemSpy: ReturnType<typeof vi.fn>;
  let createProblemFromDialogSpy: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof provideRouterNavigateSpy>['navigate'];

  const container = createMockTaskContainer();
  const problems = [
    createMockProblem(201, 'First problem'),
    createMockProblem(202, 'Second problem'),
  ];

  beforeEach(async () => {
    finishProblemSpy = vi.fn().mockReturnValue(of(undefined));
    createProblemFromDialogSpy = vi.fn().mockReturnValue(of(undefined));
    const router = provideRouterNavigateSpy();
    navigate = router.navigate;

    await TestBed.configureTestingModule({
      imports: [ProblemsListComponent],
      providers: [
        ...router.providers,
        {
          provide: ProblemsService,
          useValue: {
            finishProblem: finishProblemSpy,
            createProblemFromDialog: createProblemFromDialogSpy,
          },
        },
        {
          provide: CommandsService,
          useValue: {
            getDataStateChange: () => EMPTY,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProblemsListComponent);
    fixture.componentRef.setInput('container', container);
    fixture.componentRef.setInput('problems', problems);
    fixture.detectChanges();
  });

  describe('finish problem', () => {
    it('calls finishProblem with the selected problem when done is clicked', () => {
      const rowCheckbox = fixture.debugElement.query(By.css('td mat-checkbox'));
      rowCheckbox.triggerEventHandler('change', { checked: true });
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll(
        'button[mat-mini-fab]',
      ) as NodeListOf<HTMLButtonElement>;
      const doneButton = buttons[1];

      doneButton.click();
      fixture.detectChanges();

      expect(finishProblemSpy).toHaveBeenCalledOnce();
      expect(finishProblemSpy).toHaveBeenCalledWith(problems[0]);
    });
  });

  describe('problem navigation', () => {
    it('navigates to the problem route when a row is clicked', () => {
      const descriptionCell = fixture.debugElement.query(
        By.css('td.mat-column-description'),
      );

      descriptionCell.nativeElement.click();
      fixture.detectChanges();

      expect(navigate).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith(['problem', problems[0].id]);
    });
  });

  describe('add problem', () => {
    it('calls createProblemFromDialog when the add button is clicked', () => {
      const addButton = fixture.nativeElement.querySelector(
        '#add-problem-button',
      ) as HTMLButtonElement;

      addButton.click();
      fixture.detectChanges();

      expect(createProblemFromDialogSpy).toHaveBeenCalledOnce();
      expect(createProblemFromDialogSpy).toHaveBeenCalledWith(container);
    });
  });
});
