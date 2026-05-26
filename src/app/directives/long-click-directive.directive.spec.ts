import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LongClickDirectiveDirective } from './long-click-directive.directive';

@Component({
  standalone: true,
  imports: [LongClickDirectiveDirective],
  template: '<button appLongClickDirective>Click</button>',
})
class TestHostComponent {}

describe('LongClickDirectiveDirective', () => {
  it('should create an instance', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });
});
