import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFromListDialog } from './select-from-list-dialog.component';

describe('SelectFromListDialogComponent', () => {
  let component: SelectFromListDialog;
  let fixture: ComponentFixture<SelectFromListDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFromListDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFromListDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
