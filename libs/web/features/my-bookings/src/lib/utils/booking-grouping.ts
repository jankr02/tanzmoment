import { BookingDetail } from '@tanzmoment/shared/types';

export type BookingTab = 'upcoming' | 'past' | 'cancelled';

export const BOOKING_TAB_ORDER: BookingTab[] = ['upcoming', 'past', 'cancelled'];

export const BOOKING_TAB_LABELS: Record<BookingTab, string> = {
  upcoming: 'Bevorstehend',
  past: 'Vergangen',
  cancelled: 'Storniert',
};

export function classifyBooking(booking: BookingDetail): BookingTab {
  const status = (booking.status ?? '').toLowerCase();

  if (status === 'cancelled' || status === 'rejected') {
    return 'cancelled';
  }

  if (status === 'completed' || status === 'attended' || status === 'no_show') {
    return 'past';
  }

  if (booking.session?.startTime) {
    const sessionDate = new Date(booking.session.startTime);
    if (!Number.isNaN(sessionDate.getTime()) && sessionDate.getTime() < Date.now()) {
      return 'past';
    }
  }

  return 'upcoming';
}

export function groupByTab(
  bookings: BookingDetail[],
): Record<BookingTab, BookingDetail[]> {
  const result: Record<BookingTab, BookingDetail[]> = {
    upcoming: [],
    past: [],
    cancelled: [],
  };

  for (const booking of bookings) {
    result[classifyBooking(booking)].push(booking);
  }

  result.upcoming.sort(byNextSessionAsc);
  result.past.sort(byNextSessionDesc);
  result.cancelled.sort(byCancelledOrCreatedDesc);

  return result;
}

function byNextSessionAsc(a: BookingDetail, b: BookingDetail): number {
  const aTime = a.session ? new Date(a.session.startTime).getTime() : Infinity;
  const bTime = b.session ? new Date(b.session.startTime).getTime() : Infinity;
  return aTime - bTime;
}

function byNextSessionDesc(a: BookingDetail, b: BookingDetail): number {
  const aTime = a.session ? new Date(a.session.startTime).getTime() : 0;
  const bTime = b.session ? new Date(b.session.startTime).getTime() : 0;
  return bTime - aTime;
}

function byCancelledOrCreatedDesc(a: BookingDetail, b: BookingDetail): number {
  const aTime = new Date(a.cancelledAt ?? a.createdAt).getTime();
  const bTime = new Date(b.cancelledAt ?? b.createdAt).getTime();
  return bTime - aTime;
}
