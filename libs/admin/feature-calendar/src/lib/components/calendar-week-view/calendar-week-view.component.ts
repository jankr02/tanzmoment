import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarSession } from '@tanzmoment/admin/data-access';

const DANCE_STYLE_COLORS: Record<string, string> = {
  accessible: '#A9CDD4',
  expressive: '#FBD8CF',
  kids: '#E6B854',
  mothers: '#688B68',
};

const DEFAULT_COLOR = '#D0A373';

// Calendar range: 08:00 – 21:00 (13 hours = 780 minutes)
const START_HOUR = 8;
const END_HOUR = 21;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

@Component({
  selector: 'admin-calendar-week-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-week-view.component.html',
  styleUrls: ['./calendar-week-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarWeekViewComponent {
  readonly days = input.required<Date[]>();
  readonly sessions = input.required<CalendarSession[]>();
  readonly sessionSelected = output<CalendarSession>();

  readonly timeSlots = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => `${String(START_HOUR + i).padStart(2, '0')}:00`
  );

  readonly sessionsByDay = computed(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const day of this.days()) {
      const key = this.dateKey(day);
      map.set(key, []);
    }
    for (const session of this.sessions()) {
      const start = new Date(session.startTime);
      const key = this.dateKey(start);
      const existing = map.get(key);
      if (existing) {
        existing.push(session);
      }
    }
    return map;
  });

  getSessionsForDay(day: Date): CalendarSession[] {
    return this.sessionsByDay().get(this.dateKey(day)) ?? [];
  }

  getSessionStyle(session: CalendarSession): Record<string, string> {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const offsetMinutes = startMinutes - START_HOUR * 60;
    const durationMinutes = endMinutes - startMinutes;

    const topPercent = (offsetMinutes / TOTAL_MINUTES) * 100;
    const heightPercent = (durationMinutes / TOTAL_MINUTES) * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 3)}%`,
      'background-color': DANCE_STYLE_COLORS[session.danceStyle] ?? DEFAULT_COLOR,
    };
  }

  getOccupancy(session: CalendarSession): string {
    return `${session.bookedCount}/${session.maxParticipants}`;
  }

  getOccupancyPercent(session: CalendarSession): number {
    if (session.maxParticipants === 0) return 0;
    return Math.round((session.bookedCount / session.maxParticipants) * 100);
  }

  formatDayHeader(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: 'numeric',
    }).format(date);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  formatSessionTime(session: CalendarSession): string {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const fmt = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${fmt(start)} – ${fmt(end)}`;
  }

  onSessionClick(session: CalendarSession, event: MouseEvent): void {
    event.stopPropagation();
    this.sessionSelected.emit(session);
  }

  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
}
