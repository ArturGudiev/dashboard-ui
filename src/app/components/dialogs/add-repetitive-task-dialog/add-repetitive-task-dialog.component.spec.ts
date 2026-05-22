import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRepetitiveTaskDialogComponent } from './add-repetitive-task-dialog.component';

describe('AddRepetitiveTaskDialogComponent', () => {
  let component: AddRepetitiveTaskDialogComponent;
  let fixture: ComponentFixture<AddRepetitiveTaskDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRepetitiveTaskDialogComponent]
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
