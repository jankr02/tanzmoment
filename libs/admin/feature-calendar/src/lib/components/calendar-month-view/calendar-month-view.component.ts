import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay, CalendarSession } from '@tanzmoment/admin/data-access';

const DANCE_STYLE_COLORS: Record<string, string> = {
  accessible: '#A9CDD4',
  expressive: '#FBD8CF',
  kids: '#E6B854',
  mothers: '#688B68',
};

const DEFAULT_COLOR = '#D0A373';

@Component({
  selector: 'admin-calendar-month-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-month-view.component.html',
  styleUrls: ['./calendar-month-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthViewComponent {
  readonly calendarDays = input.required<CalendarDay[]>();
  readonly sessionSelected = output<CalendarSession>();

  readonly weekDayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  getSessionColor(session: CalendarSession): string {
    return DANCE_STYLE_COLORS[session.danceStyle] ?? DEFAULT_COLOR;
  }

  formatSessionTime(session: CalendarSession): string {
    const start = new Date(session.startTime);
    return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
  }

  onSessionClick(session: CalendarSession, event: MouseEvent): void {
    event.stopPropagation();
    this.sessionSelected.emit(session);
  }

  trackDay(_index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  trackSession(_index: number, session: CalendarSession): string {
    return session.id;
  }
}
