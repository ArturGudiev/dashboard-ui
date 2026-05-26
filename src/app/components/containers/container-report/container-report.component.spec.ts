import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { createMockTaskContainer } from '../../../testing/test-utils';
import { TaskContainerService } from '../../../services/task-container-services/task-container.service';
import { ContainerReportComponent } from './container-report.component';

describe('ContainerReportComponent', () => {
  let component: ContainerReportComponent;
  let fixture: ComponentFixture<ContainerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerReportComponent],
      providers: [
        {
          provide: TaskContainerService,
          useValue: {
            getReport: () => of(null),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('container', createMockTaskContainer());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
