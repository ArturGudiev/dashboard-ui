import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMatDialogTest } from '../../../testing/test-utils';
import { GetDatetimeDialogComponent } from './get-datetime-dialog.component';

describe('GetDatetimeDialogComponent', () => {
  let component: GetDatetimeDialogComponent;
  let fixture: ComponentFixture<GetDatetimeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetDatetimeDialogComponent],
      providers: provideMatDialogTest(),
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
