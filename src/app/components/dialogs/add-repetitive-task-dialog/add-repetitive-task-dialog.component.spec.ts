import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { createMockTaskContainer, provideMatDialogTest } from '../../../testing/test-utils';
import { RepetitiveTasksService } from '../../../services/task-container-services/repetitive-tasks.service';
import { AddRepetitiveTaskDialogComponent } from './add-repetitive-task-dialog.component';

describe('AddRepetitiveTaskDialogComponent', () => {
  let component: AddRepetitiveTaskDialogComponent;
  let fixture: ComponentFixture<AddRepetitiveTaskDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRepetitiveTaskDialogComponent],
      providers: [
        ...provideMatDialogTest({ title: 'test', taskContainer: createMockTaskContainer() }),
        {
          provide: RepetitiveTasksService,
          useValue: {
            addNewRepetitiveTask: () => of(undefined),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRepetitiveTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
