import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appLongClickDirective]',
  standalone: true
})
export class LongClickDirectiveDirective {
  @Output() longClick = new EventEmitter();
  @Output() simpleClick = new EventEmitter();

  private touchTimeout: any | undefined;
  private readonly longPressDuration = 500; // Time in milliseconds
  private longClickTriggered = false;

  constructor(private el: ElementRef) {
    this.el.nativeElement.addEventListener('click', (event: any) => {
      if (this.longClickTriggered) {
        event.stopImmediatePropagation();
        this.longClickTriggered = false;
      } else {
        this.simpleClick.emit(event);
      }
    }, true);
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseDown() {
    this.touchTimeout = setTimeout(() => {
      this.longClick.emit();
      this.longClickTriggered = true;
    }, this.longPressDuration);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  @HostListener('touchcancel')
  cancelLongClick() {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = undefined;
    }
  }
}
