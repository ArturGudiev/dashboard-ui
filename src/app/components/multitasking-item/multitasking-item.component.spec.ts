import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultitaskingItemComponent } from './multitasking-item.component';

describe('MultitaskingItemComponent', () => {
  let component: MultitaskingItemComponent;
  let fixture: ComponentFixture<MultitaskingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultitaskingItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultitaskingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
