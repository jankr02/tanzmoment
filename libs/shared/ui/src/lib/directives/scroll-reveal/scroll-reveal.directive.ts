import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ScrollRevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade';

@Directive({
  selector: '[tmScrollReveal]',
  standalone: true,
  host: {
    'class': 'tm-scroll-reveal',
    '[class.tm-scroll-reveal--up]': 'direction === "up"',
    '[class.tm-scroll-reveal--down]': 'direction === "down"',
    '[class.tm-scroll-reveal--left]': 'direction === "left"',
    '[class.tm-scroll-reveal--right]': 'direction === "right"',
    '[class.tm-scroll-reveal--fade]': 'direction === "fade"',
  },
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private observer: IntersectionObserver | null = null;

  /** Animation direction. Default: 'up' */
  @Input('tmScrollReveal') direction: ScrollRevealDirection | '' = 'up';

  /** Viewport threshold (0–1): how much of the element must be visible before reveal. */
  @Input() revealThreshold = 0.15;

  /** Delay in ms — use for staggered list animations. */
  @Input() revealDelay = 0;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.direction === '') this.direction = 'up';

    if (this.revealDelay > 0) {
      this.el.nativeElement.style.setProperty(
        '--reveal-delay',
        `${this.revealDelay}ms`
      );
    }

    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('tm-scroll-reveal--visible');
            this.observer?.disconnect();
          }
        },
        {
          threshold: this.revealThreshold,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
