import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultitaskingComponent } from './multitasking.component';

describe('MultitaskingComponent', () => {
  let component: MultitaskingComponent;
  let fixture: ComponentFixture<MultitaskingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultitaskingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultitaskingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
