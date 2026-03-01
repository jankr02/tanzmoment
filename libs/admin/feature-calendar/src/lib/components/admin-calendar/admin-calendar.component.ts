import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AdminApiService,
  CalendarSession,
  CalendarView,
  CalendarDay,
} from '@tanzmoment/admin/data-access';
import { CalendarWeekViewComponent } from '../calendar-week-view/calendar-week-view.component';
import { CalendarMonthViewComponent } from '../calendar-month-view/calendar-month-view.component';

const DANCE_STYLE_LABELS: Record<string, string> = {
  accessible: 'Accessible Dance',
  expressive: 'Ausdruckstanz',
  kids: 'Kinderkurse',
  mothers: 'Mütterkurse',
};

@Component({
  selector: 'admin-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, CalendarWeekViewComponent, CalendarMonthViewComponent],
  templateUrl: './admin-calendar.component.html',
  styleUrls: ['./admin-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCalendarComponent {
  private readonly adminApi = inject(AdminApiService);

  readonly view = signal<CalendarView>('week');
  readonly currentDate = signal(new Date());
  readonly sessions = signal<CalendarSession[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedSession = signal<CalendarSession | null>(null);

  readonly calendarRange = computed(() => {
    const date = this.currentDate();
    if (this.view() === 'week') {
      return this.getWeekRange(date);
    }
    return this.getMonthRange(date);
  });

  readonly displayedDays = computed<Date[]>(() => {
    const { from, to } = this.calendarRange();
    const days: Date[] = [];
    const current = new Date(from);
    while (current <= to) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const date = this.currentDate();
    const today = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust first day to Monday
    const startOffset = (firstDay.getDay() + 6) % 7;
    const start = new Date(firstDay);
    start.setDate(start.getDate() - startOffset);

    // Fill 6 weeks (42 days)
    const days: CalendarDay[] = [];
    const cursor = new Date(start);

    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(cursor);
      const daySessions = this.sessions().filter((s) => {
        const sd = new Date(s.startTime);
        return (
          sd.getFullYear() === dayDate.getFullYear() &&
          sd.getMonth() === dayDate.getMonth() &&
          sd.getDate() === dayDate.getDate()
        );
      });

      days.push({
        date: dayDate,
        isCurrentMonth: dayDate.getMonth() === month,
        isToday:
          dayDate.getFullYear() === today.getFullYear() &&
          dayDate.getMonth() === today.getMonth() &&
          dayDate.getDate() === today.getDate(),
        sessions: daySessions,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  });

  readonly headerLabel = computed(() => {
    const date = this.currentDate();
    if (this.view() === 'week') {
      const { from, to } = this.calendarRange();
      const sameMonth = from.getMonth() === to.getMonth();
      if (sameMonth) {
        return new Intl.DateTimeFormat('de-DE', {
          month: 'long',
          year: 'numeric',
        }).format(from);
      }
      return `${new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(from)} – ${new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' }).format(to)}`;
    }
    return new Intl.DateTimeFormat('de-DE', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  });

  constructor() {
    effect(() => {
      const { from, to } = this.calendarRange();
      this.loadSessions(from, to);
    });
  }

  loadSessions(from: Date, to: Date): void {
    this.loading.set(true);
    this.error.set(null);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    this.adminApi.getCalendar(fmt(from), fmt(to)).subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kalender konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  setView(view: CalendarView): void {
    this.view.set(view);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  goToPrevious(): void {
    const date = new Date(this.currentDate());
    if (this.view() === 'week') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setMonth(date.getMonth() - 1);
    }
    this.currentDate.set(date);
  }

  goToNext(): void {
    const date = new Date(this.currentDate());
    if (this.view() === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    this.currentDate.set(date);
  }

  onSessionSelected(session: CalendarSession): void {
    this.selectedSession.set(session);
  }

  closeFlyout(): void {
    this.selectedSession.set(null);
  }

  formatFlyoutDate(session: CalendarSession): string {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(session.startTime));
  }

  formatFlyoutEndTime(session: CalendarSession): string {
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(session.endTime));
  }

  getDanceStyleLabel(style: string): string {
    return DANCE_STYLE_LABELS[style] ?? style;
  }

  getOccupancyPercent(session: CalendarSession): number {
    if (session.maxParticipants === 0) return 0;
    return Math.min(
      Math.round((session.bookedCount / session.maxParticipants) * 100),
      100
    );
  }

  private getWeekRange(date: Date): { from: Date; to: Date } {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7; // Monday = 0
    const from = new Date(d);
    from.setDate(d.getDate() - diff);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }

  private getMonthRange(date: Date): { from: Date; to: Date } {
    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    from.setHours(0, 0, 0, 0);

    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }
}
