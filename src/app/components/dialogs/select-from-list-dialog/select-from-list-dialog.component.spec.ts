import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMatDialogTest } from '../../../testing/test-utils';
import { SelectFromListDialog } from './select-from-list-dialog.component';

describe('SelectFromListDialogComponent', () => {
  let component: SelectFromListDialog<string>;
  let fixture: ComponentFixture<SelectFromListDialog<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFromListDialog],
      providers: provideMatDialogTest({ returnWithIndex: false, values: [] }),
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFromListDialog<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
