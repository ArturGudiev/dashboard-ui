import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetDatetimeDialogComponent } from './get-datetime-dialog.component';

describe('GetDatetimeDialogComponent', () => {
  let component: GetDatetimeDialogComponent;
  let fixture: ComponentFixture<GetDatetimeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetDatetimeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetDatetimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
