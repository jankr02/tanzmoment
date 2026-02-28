// ============================================================================
// BOOKING MODAL COMPONENT
// ============================================================================
// Centered dialog for the booking flow.
// Manages: open/close, backdrop, focus trap, scroll lock, Esc key.
// Content (form) is projected via <ng-content>.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  HostBinding,
  PLATFORM_ID,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ui-booking-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="booking-modal__backdrop"
        (click)="onBackdropClick()"
      ></div>

      <!-- Dialog -->
      <div
        class="booking-modal__dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel"
        #dialogRef
      >
        <!-- Header -->
        <div class="booking-modal__header">
          <h2 class="booking-modal__title">{{ title }}</h2>
          <button
            class="booking-modal__close"
            (click)="close()"
            aria-label="Dialog schließen"
          >
            <app-icon name="x" size="md" />
          </button>
        </div>

        <!-- Content (projected) -->
        <div class="booking-modal__content">
          <ng-content />
        </div>
      </div>
    }
  `,
  styleUrl: './booking-modal.component.scss',
})
export class BookingModalComponent implements OnChanges, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  @Input() isOpen = false;
  @Input() title = 'Buchung';
  @Input() ariaLabel = 'Kurs buchen';

  @HostBinding('class.is-open')
  get hostIsOpen(): boolean {
    return this.isOpen;
  }

  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialogRef') dialogRef?: ElementRef<HTMLElement>;

  private keydownListener?: (e: KeyboardEvent) => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen'] || !isPlatformBrowser(this.platformId)) return;

    if (this.isOpen) {
      this.document.body.style.overflow = 'hidden';
      this.addKeydownListener();
      setTimeout(() => this.dialogRef?.nativeElement?.focus(), 50);
    } else {
      this.document.body.style.overflow = '';
      this.removeKeydownListener();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = '';
      this.removeKeydownListener();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.close();
  }

  private addKeydownListener(): void {
    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
    this.document.addEventListener('keydown', this.keydownListener);
  }

  private removeKeydownListener(): void {
    if (this.keydownListener) {
      this.document.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = undefined;
    }
  }
}
