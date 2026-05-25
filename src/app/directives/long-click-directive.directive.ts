import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';

@Directive({
  selector: '[appLongClickDirective]',
  standalone: true
})
export class LongClickDirectiveDirective {
  @Output() longClick = new EventEmitter<void>();
  @Output() simpleClick = new EventEmitter<MouseEvent>();

  private readonly el = inject(ElementRef);
  private touchTimeout: number | undefined;
  private readonly longPressDuration = 500; // Time in milliseconds
  private longClickTriggered = false;

  constructor() {
    this.el.nativeElement.addEventListener('click', this.onNativeClick, true);
  }

  private readonly onNativeClick = (event: MouseEvent) => {
    if (this.longClickTriggered) {
      event.stopImmediatePropagation();
      this.longClickTriggered = false;
    } else {
      this.simpleClick.emit(event);
    }
  };

  @HostListener('mousedown')
  @HostListener('touchstart')
  onMouseDown() {
    this.touchTimeout = window.setTimeout(() => {
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
