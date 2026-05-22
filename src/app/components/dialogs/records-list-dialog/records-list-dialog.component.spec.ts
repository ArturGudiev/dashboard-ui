import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsListDialogComponent } from './records-list-dialog.component';

// if empty array should stop spinner

describe('RecordsListDialogComponent', () => {
  let component: RecordsListDialogComponent;
  let fixture: ComponentFixture<RecordsListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordsListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
