import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockStory } from '../../../testing/test-utils';
import { SubStoriesComponent } from './sub-stories.component';

describe('SubStoriesComponent', () => {
  let fixture: ComponentFixture<SubStoriesComponent>;
  let storyClickEmitSpy: ReturnType<typeof vi.spyOn>;
  let addSubstoryEmitSpy: ReturnType<typeof vi.spyOn>;

  const stories = [
    createMockStory(501, 'First story'),
    createMockStory(502, 'Second story'),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubStoriesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubStoriesComponent);
    storyClickEmitSpy = vi.spyOn(fixture.componentInstance.storyClick, 'emit');
    addSubstoryEmitSpy = vi.spyOn(fixture.componentInstance.addSubstory, 'emit');
    fixture.componentRef.setInput('stories', stories);
    fixture.detectChanges();
  });

  describe('story navigation', () => {
    it('emits storyClick with the story when a row is clicked', () => {
      const descriptionCell = fixture.debugElement.query(
        By.css('td.mat-column-description'),
      );

      descriptionCell.nativeElement.click();
      fixture.detectChanges();

      expect(storyClickEmitSpy).toHaveBeenCalledOnce();
      expect(storyClickEmitSpy).toHaveBeenCalledWith(stories[0]);
    });
  });

  describe('add substory', () => {
    it('emits addSubstory when the add button is clicked', () => {
      const addButton = fixture.nativeElement.querySelector(
        '#add-story-button',
      ) as HTMLButtonElement;

      addButton.click();
      fixture.detectChanges();

      expect(addSubstoryEmitSpy).toHaveBeenCalledOnce();
    });
  });
});
