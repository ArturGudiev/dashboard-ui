import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EMPTY, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockQuestion,
  createMockTaskContainer,
  provideRouterNavigateSpy,
} from '../../../testing/test-utils';
import { CommandsService } from '../../../services/commands.service';
import { QuestionsService } from '../../../services/task-container-services/questions.service';
import { QuestionsListComponent } from './questions-list.component';

describe('QuestionsListComponent', () => {
  let fixture: ComponentFixture<QuestionsListComponent>;
  let createQuestionFromDialogSpy: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof provideRouterNavigateSpy>['navigate'];

  const container = createMockTaskContainer();
  const questions = [
    createMockQuestion(301, 'First question'),
    createMockQuestion(302, 'Second question'),
  ];

  beforeEach(async () => {
    createQuestionFromDialogSpy = vi.fn().mockReturnValue(of(undefined));
    const router = provideRouterNavigateSpy();
    navigate = router.navigate;

    await TestBed.configureTestingModule({
      imports: [QuestionsListComponent],
      providers: [
        ...router.providers,
        {
          provide: QuestionsService,
          useValue: {
            createQuestionFromDialog: createQuestionFromDialogSpy,
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

    fixture = TestBed.createComponent(QuestionsListComponent);
    fixture.componentRef.setInput('container', container);
    fixture.componentRef.setInput('questions', questions);
    fixture.detectChanges();
  });

  describe('question navigation', () => {
    it('navigates to the question route when a row is clicked', () => {
      const descriptionCell = fixture.debugElement.query(
        By.css('td.mat-column-description'),
      );

      descriptionCell.nativeElement.click();
      fixture.detectChanges();

      expect(navigate).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith(['question', questions[0].id]);
    });
  });

  describe('add question', () => {
    it('calls createQuestionFromDialog when the add button is clicked', () => {
      const addButton = fixture.nativeElement.querySelector(
        '#add-question-button',
      ) as HTMLButtonElement;

      addButton.click();
      fixture.detectChanges();

      expect(createQuestionFromDialogSpy).toHaveBeenCalledOnce();
      expect(createQuestionFromDialogSpy).toHaveBeenCalledWith(container);
    });
  });
});
