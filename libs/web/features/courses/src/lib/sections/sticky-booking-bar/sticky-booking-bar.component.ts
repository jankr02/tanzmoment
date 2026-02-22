// ============================================================================
// STICKY BOOKING BAR
// ============================================================================
// Fixed bottom bar with course title, price and booking CTA.
// Appears at 400px scroll position with slide-up animation.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { ButtonComponent } from '@tanzmoment/shared/ui';
import {
  CourseDetailData,
  CourseDetailBookingContent,
} from '../../types/course-detail.types';

const SCROLL_THRESHOLD = 400;

@Component({
  selector: 'app-sticky-booking-bar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './sticky-booking-bar.component.html',
  styleUrl: './sticky-booking-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyBookingBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailBookingContent;

  @Output() bookClick = new EventEmitter<void>();

  // ─── Services ───────────────────────────────────────────────────────────
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  // ─── State ──────────────────────────────────────────────────────────────

  readonly isVisible = signal(false);

  private scrollListener?: () => void;

  // ─── Resolved Values ────────────────────────────────────────────────────

  get ctaText(): string {
    if (this.course.isFullyBooked) return 'Ausgebucht';
    return this.content?.ctaText ?? 'Jetzt buchen';
  }

  get priceNote(): string | undefined {
    return this.content?.priceNote;
  }

  get notice(): string | undefined {
    return this.content?.notice;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.scrollListener = () => {
          const shouldShow = window.scrollY > SCROLL_THRESHOLD;
          if (this.isVisible() !== shouldShow) {
            this.ngZone.run(() => {
              this.isVisible.set(shouldShow);
            });
          }
        };

        window.addEventListener('scroll', this.scrollListener, {
          passive: true,
        });

        this.scrollListener();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  onBook(): void {
    if (!this.course.isFullyBooked) {
      this.bookClick.emit();
    }
  }
}
