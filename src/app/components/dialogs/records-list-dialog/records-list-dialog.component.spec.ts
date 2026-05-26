import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideMatDialogTest } from '../../../testing/test-utils';
import { RecordsService } from '../../../services/records.service';
import { RecordsListDialogComponent } from './records-list-dialog.component';

// if empty array should stop spinner

describe('RecordsListDialogComponent', () => {
  let component: RecordsListDialogComponent;
  let fixture: ComponentFixture<RecordsListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RecordsListDialogComponent ],
      providers: [
        ...provideMatDialogTest({ tag: 'test' }),
        {
          provide: RecordsService,
          useValue: {
            getRecords: () => of({ arrInfo: { length: 0 }, items: [] }),
          },
        },
      ],
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
