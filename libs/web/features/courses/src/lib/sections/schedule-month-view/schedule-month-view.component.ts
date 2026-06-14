// ============================================================================
// SCHEDULE MONTH VIEW
// ============================================================================
// 7-column month grid (Mo–So) with up to 3 session chips per day.
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
  WD_SHORT,
  addDays,
  formatTime,
  groupVars,
  isoDow,
  minutesOfDay,
  resolveGroup,
  sameDay,
  startOfWeek,
} from '../../pages/course-schedule/course-schedule.types';

interface MonthChip {
  session: CalendarSession;
  vars: Record<string, string>;
  timeLabel: string;
  delayMs: number;
}

interface MonthCell {
  key: string;
  dayNumber: number;
  outOfMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  chips: MonthChip[];
  moreCount: number;
}

@Component({
  selector: 'tm-schedule-month-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-month-view.component.html',
  styleUrl: './schedule-month-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleMonthViewComponent {
  readonly sessions = input.required<CalendarSession[]>();
  readonly monthDate = input.required<Date>();
  readonly select = output<CalendarSession>();

  readonly weekdayHeaders = [1, 2, 3, 4, 5, 6, 7].map((d) => WD_SHORT[d]);

  readonly cells = computed<MonthCell[]>(() => {
    const monthDate = this.monthDate();
    const month = monthDate.getMonth();
    const today = new Date();
    const gridStart = startOfWeek(new Date(monthDate.getFullYear(), month, 1));

    const all: Date[] = [];
    for (let i = 0; i < 42; i++) all.push(addDays(gridStart, i));

    let lastNeeded = 5;
    for (let i = 41; i >= 0; i--) {
      if (all[i].getMonth() === month) {
        lastNeeded = Math.floor(i / 7);
        break;
      }
    }

    return all.slice(0, (lastNeeded + 1) * 7).map((date) => {
      const outOfMonth = date.getMonth() !== month;
      const dayCourses = outOfMonth
        ? []
        : this.sessions()
            .filter((s) => sameDay(new Date(s.startTime), date))
            .sort(
              (a, b) => minutesOfDay(a.startTime) - minutesOfDay(b.startTime),
            );

      const chips: MonthChip[] = dayCourses.slice(0, 3).map((session, idx) => {
        const group: GroupKey = resolveGroup(session);
        return {
          session,
          vars: groupVars(group),
          timeLabel: formatTime(session.startTime),
          delayMs: idx * 25,
        };
      });

      return {
        key: date.toISOString(),
        dayNumber: date.getDate(),
        outOfMonth,
        isToday: !outOfMonth && sameDay(date, today),
        isWeekend: isoDow(date) >= 6,
        chips,
        moreCount: dayCourses.length - chips.length,
      };
    });
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
