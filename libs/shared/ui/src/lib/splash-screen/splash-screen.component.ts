import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  signal,
  effect,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
  isDevMode,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, timer } from 'rxjs';
import { takeUntil, delay, tap } from 'rxjs/operators';

/**
 * Splash Screen Component
 *
 * Full-screen intro sequence featuring an organic illustration and brand messaging.
 * Includes smooth fade-in/fade-out animations and a two-phase text sequence.
 *
 * Features:
 * - Auto-fade after configurable duration
 * - Skip button for immediate transition
 * - Animated brand sequence: "Tanzmoment" → Main message
 * - Dancing woman + swaying plant animation on fade-out
 * - Inline SVG loading for CSS animation access
 * - Event emitter for parent component communication
 * - Accessibility optimized (ARIA, reduced motion support)
 * - GPU-accelerated animations
 *
 * @example
 * <app-splash-screen
 *   [duration]="3000"
 *   [autoFade]="true"
 *   [showSkipButton]="true"
 *   [brandIntroDelay]="1500"
 *   (completed)="onSplashCompleted()"
 * />
 */
/**
 * Animation timing constants (in milliseconds)
 */
const ANIMATION_TIMINGS = {
  /** Initial state transition delay */
  INITIAL_STATE: 50,
  /** Brand fade-out animation duration */
  BRAND_FADE_OUT: 500,
  /** Splash screen fade-out duration */
  SPLASH_FADE_OUT: 800,
  /** SVG verification delay */
  SVG_VERIFY: 100,
} as const;

/**
 * Animation state type for accessibility and lifecycle tracking
 */
type AnimationState = 'entering' | 'visible' | 'leaving' | 'hidden';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  // ==========================================================================
  // View References
  // ==========================================================================

  @ViewChild('illustrationContainer', { static: false })
  illustrationContainer?: ElementRef<HTMLDivElement>;

  // ==========================================================================
  // Configuration
  // ==========================================================================

  /** Display duration in milliseconds before auto-fade */
  @Input() duration = 3000;

  /** Enable automatic fade-out after duration */
  @Input() autoFade = true;

  /** Show skip button */
  @Input() showSkipButton = true;

  /** Path to SVG illustration */
  @Input() svgPath = 'assets/images/intro-sequence-animated.svg';

  /** Delay before brand name fades out (for text sequence) */
  @Input() brandIntroDelay = 1500;

  // ==========================================================================
  // Events
  // ==========================================================================

  /** Emitted when splash screen completes */
  @Output() completed = new EventEmitter<void>();

  // ==========================================================================
  // State
  // ==========================================================================

  /** Splash screen visibility */
  visible = signal(true);

  /** Fade-out animation active */
  fadingOut = signal(false);

  /** SVG loaded and injected */
  svgLoaded = signal(false);

  /** Brand name hidden (triggers text sequence) */
  brandHidden = signal(false);

  /** Brand name fading out (triggers exit animation) */
  brandFadingOut = signal(false);

  /** Animation state for accessibility */
  animationState: AnimationState = 'entering';

  /** Sanitized SVG content for template */
  svgContent: SafeHtml = '';

  /** Subject for managing subscription cleanup */
  private readonly destroy$ = new Subject<void>();

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.completed.emit();
      }
    });
  }

  ngOnInit(): void {
    this.loadSvg();
    this.setupAnimationTimings();
  }

  /**
   * Sets up RxJS-based animation timings.
   * Replaces setTimeout for better cleanup and testability.
   */
  private setupAnimationTimings(): void {
    // Initial animation state change
    timer(ANIMATION_TIMINGS.INITIAL_STATE)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.animationState = 'visible';
      });

    // Brand fade-out sequence
    timer(this.brandIntroDelay)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.brandFadingOut.set(true)),
        delay(ANIMATION_TIMINGS.BRAND_FADE_OUT)
      )
      .subscribe(() => {
        this.brandHidden.set(true);
      });

    // Auto-fade splash screen
    if (this.autoFade) {
      timer(this.duration)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.hide();
        });
    }
  }

  ngAfterViewInit(): void {
    if (this.svgLoaded() && this.illustrationContainer && isDevMode()) {
      this.verifyInlineSvg();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // SVG Loading
  // ==========================================================================

  /**
   * Loads SVG file and injects it inline into the template.
   * This allows CSS to access internal SVG elements (e.g., #woman, #plant).
   */
  private loadSvg(): void {
    this.http
      .get(this.svgPath, { responseType: 'text' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (svgText) => {
          const cleanedSvg = this.cleanSvgForInline(svgText);
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(cleanedSvg);
          this.svgLoaded.set(true);
        },
        error: (err) => {
          console.error('Failed to load SVG illustration:', err);
          this.svgLoaded.set(true);
        },
      });
  }

  /**
   * Cleans SVG for inline use by removing XML declarations.
   */
  private cleanSvgForInline(svgText: string): string {
    return svgText.replace(/<\?xml[^>]*\?>/g, '').trim();
  }

  /**
   * Verifies that SVG elements are accessible in the DOM.
   * Used for development debugging only.
   */
  private verifyInlineSvg(): void {
    timer(ANIMATION_TIMINGS.SVG_VERIFY)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const woman = document.querySelector('#woman');
        const plant = document.querySelector('#plant');

        if (!woman || !plant) {
          console.warn(
            'SVG animation elements not found. Ensure SVG is properly inline.'
          );
        }
      });
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Hides the splash screen with fade-out animation.
   * Triggers dance animation for SVG elements.
   */
  hide(): void {
    if (this.fadingOut()) return;

    this.animationState = 'leaving';
    this.fadingOut.set(true);

    this.triggerDanceAnimation();

    timer(ANIMATION_TIMINGS.SPLASH_FADE_OUT)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.visible.set(false);
        this.animationState = 'hidden';
      });
  }

  /**
   * Triggers CSS animations for SVG elements by adding animation class.
   */
  private triggerDanceAnimation(): void {
    if (this.illustrationContainer) {
      this.illustrationContainer.nativeElement.classList.add(
        'splash-screen__illustration--dancing'
      );
    }
  }

  /**
   * Handles skip button click.
   * Cancels all pending timers and immediately triggers fade-out.
   */
  onSkip(): void {
    // Complete all pending subscriptions
    this.destroy$.next();
    this.hide();
  }
}