import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { createMockTaskContainer, emptyIdListRefresh } from '../../../testing/test-utils';
import { TasksService } from '../../../services/task-container-services/tasks.service';
import { MultitaskingItemComponent } from './multitasking-item.component';

describe('MultitaskingItemComponent', () => {
  let component: MultitaskingItemComponent;
  let fixture: ComponentFixture<MultitaskingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MultitaskingItemComponent ],
      providers: [
        {
          provide: TasksService,
          useValue: {
            getTasks: () => of([]),
          },
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultitaskingItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('taskContainer', createMockTaskContainer());
    fixture.componentRef.setInput('refreshTasks$', emptyIdListRefresh());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
