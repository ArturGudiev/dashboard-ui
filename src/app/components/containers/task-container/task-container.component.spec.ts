import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { setRequiredTaskContainerInputs } from '../../../testing/test-utils';
import { HotkeysService } from 'angular2-hotkeys';
import { CommandsService } from '../../../services/commands.service';
import { TaskContainerService } from '../../../services/task-container-services/task-container.service';
import { TasksService } from '../../../services/task-container-services/tasks.service';
import { ProblemsService } from '../../../services/task-container-services/problems.service';
import { QuestionsService } from '../../../services/task-container-services/questions.service';
import { TaskContainerComponent } from './task-container.component';

describe('TaskContainerComponent', () => {
  let component: TaskContainerComponent;
  let fixture: ComponentFixture<TaskContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskContainerComponent],
      providers: [
        {
          provide: HotkeysService,
          useValue: {
            add: () => ({}),
          },
        },
        {
          provide: CommandsService,
          useValue: { getDataStateChange: () => EMPTY },
        },
        {
          provide: TaskContainerService,
          useValue: { refreshSubtasks$: EMPTY },
        },
        {
          provide: TasksService,
          useValue: {
            getTasks: () => of([]),
            finishTasks: () => of(undefined),
            finishTask: () => of(undefined),
          },
        },
        {
          provide: ProblemsService,
          useValue: { getProblems: () => of([]) },
        },
        {
          provide: QuestionsService,
          useValue: { getQuestions: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskContainerComponent);
    setRequiredTaskContainerInputs(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
