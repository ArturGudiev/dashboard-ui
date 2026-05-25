import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[hover-class]'
})
export class HoverClassDirective {
  @Input('hover-class') hoverClass!: string;

  private readonly elementRef = inject(ElementRef);

  @HostListener('mouseenter') onMouseEnter() {
    this.elementRef.nativeElement.classList.add(this.hoverClass);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.elementRef.nativeElement.classList.remove(this.hoverClass);
  }

}
