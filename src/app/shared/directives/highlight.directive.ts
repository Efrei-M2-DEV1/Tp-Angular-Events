import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    // Ne pas toucher au background pour respecter les thèmes
    this.renderer.setStyle(this.el.nativeElement, 'border-color', 'var(--info-color)');
  }

  @HostListener('mouseleave') onMouseLeave() {
    // Rétablir le style par défaut
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    this.renderer.setStyle(this.el.nativeElement, 'border-color', 'var(--border-color)');
  }
}
