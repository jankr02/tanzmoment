import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingDetail } from '@tanzmoment/shared/types';
import { DANCE_STYLE_COLORS } from '@tanzmoment/shared/ui';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { BookingStatusBadgeComponent } from '../booking-status-badge/booking-status-badge.component';

const DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

@Component({
  selector: 'lib-booking-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ButtonComponent, BookingStatusBadgeComponent],
  templateUrl: './booking-card.component.html',
  styleUrl: './booking-card.component.scss',
})
export class BookingCardComponent {
  readonly booking = input.required<BookingDetail>();

  readonly cancelClicked = output<BookingDetail>();
  readonly resumeCheckoutClicked = output<BookingDetail>();
  readonly rebookClicked = output<BookingDetail>();

  readonly accent = computed(() => {
    const danceStyle = this.booking().course.danceStyle;
    const scheme =
      DANCE_STYLE_COLORS[danceStyle as keyof typeof DANCE_STYLE_COLORS] ??
      DANCE_STYLE_COLORS['expressive'];
    return scheme.accent;
  });

  readonly sessionLabel = computed(() => {
    const session = this.booking().session;
    if (!session) return null;

    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    if (Number.isNaN(start.getTime())) return null;

    const dateLabel = DATE_FORMATTER.format(start);
    const timeLabel = `${TIME_FORMATTER.format(start)}–${TIME_FORMATTER.format(end)}`;
    return { date: dateLabel, time: timeLabel };
  });

  readonly instructorName = computed(() => {
    const instructor = this.booking().course.instructor;
    if (!instructor) return null;
    return `${instructor.firstName} ${instructor.lastName}`.trim();
  });

  readonly canCancel = computed(() => {
    const status = this.booking().status.toLowerCase();
    return status === 'pending' || status === 'confirmed' || status === 'waitlist' || status === 'waitlisted';
  });

  readonly canResumeCheckout = computed(() => {
    const booking = this.booking();
    const status = booking.status.toLowerCase();
    const paymentStatus = booking.payment?.status?.toLowerCase();
    return (
      status === 'pending' &&
      !!booking.payment &&
      paymentStatus !== 'paid'
    );
  });

  readonly canRebook = computed(() => {
    const status = this.booking().status.toLowerCase();
    return status === 'completed' || status === 'cancelled' || status === 'attended';
  });

  readonly waitlistInfo = computed(() => {
    const booking = this.booking();
    const status = booking.status.toLowerCase();
    if (status !== 'waitlist' && status !== 'waitlisted') return null;
    return booking.waitlistPosition ?? null;
  });
}
