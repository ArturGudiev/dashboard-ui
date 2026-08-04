import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockEpic,
  provideRouterNavigateSpy,
} from '../../../testing/test-utils';
import { EpicsListComponent } from './epics-list.component';

describe('EpicsListComponent', () => {
  let fixture: ComponentFixture<EpicsListComponent>;
  let navigate: ReturnType<typeof provideRouterNavigateSpy>['navigate'];
  let addSubepicEmitSpy: ReturnType<typeof vi.spyOn>;

  const epics = [
    createMockEpic(1, 'First epic'),
    createMockEpic(2, 'Second epic'),
  ];

  beforeEach(async () => {
    const router = provideRouterNavigateSpy();
    navigate = router.navigate;

    await TestBed.configureTestingModule({
      imports: [EpicsListComponent],
      providers: router.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(EpicsListComponent);
    addSubepicEmitSpy = vi.spyOn(fixture.componentInstance.addSubepic, 'emit');
    fixture.componentRef.setInput('epics', epics);
    fixture.componentRef.setInput('showAddButton', true);
    fixture.detectChanges();
  });

  describe('epic navigation', () => {
    it('navigates to the epic route when a row is clicked', () => {
      const descriptionCell = fixture.debugElement.query(
        By.css('td.mat-column-description'),
      );

      descriptionCell.nativeElement.click();
      fixture.detectChanges();

      expect(navigate).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith(['epic', epics[0].id]);
    });
  });

  describe('add subepic', () => {
    it('emits addSubepic when the add button is clicked', () => {
      const addButton = fixture.nativeElement.querySelector(
        '#add-epic-button',
      ) as HTMLButtonElement;

      addButton.click();
      fixture.detectChanges();

      expect(addSubepicEmitSpy).toHaveBeenCalledOnce();
    });
  });
});
