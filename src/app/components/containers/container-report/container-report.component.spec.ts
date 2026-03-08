import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerReportComponent } from './container-report.component';

describe('ContainerReportComponent', () => {
  let component: ContainerReportComponent;
  let fixture: ComponentFixture<ContainerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContainerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
