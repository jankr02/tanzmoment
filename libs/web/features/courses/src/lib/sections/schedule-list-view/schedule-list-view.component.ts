// ============================================================================
// SCHEDULE LIST VIEW
// ============================================================================
// Sessions of the current week grouped by weekday.
// ============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CalendarSession,
  GroupKey,
  GROUP_META,
  MONTHS,
  WD_LONG,
  addDays,
  formatTime,
  groupVars,
  minutesOfDay,
  resolveGroup,
  sameDay,
} from '../../pages/course-schedule/course-schedule.types';

interface ListRow {
  session: CalendarSession;
  vars: Record<string, string>;
  longLabel: string;
  startLabel: string;
  endLabel: string;
  delayMs: number;
}

interface ListDay {
  dow: number;
  name: string;
  countLabel: string;
  rows: ListRow[];
}

@Component({
  selector: 'tm-schedule-list-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-list-view.component.html',
  styleUrl: './schedule-list-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleListViewComponent {
  readonly sessions = input.required<CalendarSession[]>();
  readonly weekStart = input.required<Date>();
  readonly select = output<CalendarSession>();

  readonly days = computed<ListDay[]>(() => {
    const weekStart = this.weekStart();
    let index = 0;

    return [1, 2, 3, 4, 5, 6]
      .map((dow) => {
        const date = addDays(weekStart, dow - 1);
        const items = this.sessions()
          .filter((s) => sameDay(new Date(s.startTime), date))
          .sort((a, b) => minutesOfDay(a.startTime) - minutesOfDay(b.startTime));

        const rows: ListRow[] = items.map((session) => {
          const group: GroupKey = resolveGroup(session);
          return {
            session,
            vars: groupVars(group),
            longLabel: GROUP_META[group].long,
            startLabel: formatTime(session.startTime),
            endLabel: formatTime(session.endTime),
            delayMs: index++ * 30,
          };
        });

        return {
          dow,
          name: WD_LONG[dow],
          countLabel: `${date.getDate()}. ${MONTHS[date.getMonth()]} · ${items.length} ${
            items.length === 1 ? 'Kurs' : 'Kurse'
          }`,
          rows,
        };
      })
      .filter((day) => day.rows.length > 0);
  });

  protected onSelect(session: CalendarSession): void {
    this.select.emit(session);
  }

  protected onKey(event: KeyboardEvent, session: CalendarSession): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSelect(session);
    }
  }
}
