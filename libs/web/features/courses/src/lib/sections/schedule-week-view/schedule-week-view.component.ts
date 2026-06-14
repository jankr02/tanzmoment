// ============================================================================
// SCHEDULE WEEK VIEW
// ============================================================================
// Time-grid (Mo–Sa, 09:00–21:00) with absolutely-positioned event blocks.
// Concurrent sessions are split into side-by-side lanes.
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
  HOUR_HEIGHT,
  PX_PER_MIN,
  WD_SHORT,
  addDays,
  formatTime,
  groupVars,
  minutesOfDay,
  resolveGroup,
  sameDay,
} from '../../pages/course-schedule/course-schedule.types';

interface PositionedEvent {
  session: CalendarSession;
  group: GroupKey;
  groupLabel: string;
  vars: Record<string, string>;
  top: number;
  height: number;
  widthPct: number;
  leftPct: number;
  small: boolean;
  startLabel: string;
  endLabel: string;
  delayMs: number;
}

interface DayColumn {
  dow: number;
  shortName: string;
  dayNumber: number;
  isToday: boolean;
  isWeekend: boolean;
  events: PositionedEvent[];
}

const TOP_PAD = 12;
const DEFAULT_START_MIN = 9 * 60;
const DEFAULT_END_MIN = 21 * 60;

@Component({
  selector: 'tm-schedule-week-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-week-view.component.html',
  styleUrl: './schedule-week-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleWeekViewComponent {
  readonly sessions = input.required<CalendarSession[]>();
  readonly weekStart = input.required<Date>();
  readonly select = output<CalendarSession>();

  readonly topPad = TOP_PAD;

  /** Dynamic vertical bounds: default 09–21, extended if sessions fall outside. */
  private readonly bounds = computed(() => {
    let start = DEFAULT_START_MIN;
    let end = DEFAULT_END_MIN;
    for (const s of this.sessions()) {
      start = Math.min(start, Math.floor(minutesOfDay(s.startTime) / 60) * 60);
      end = Math.max(end, Math.ceil(minutesOfDay(s.endTime) / 60) * 60);
    }
    return { start, end };
  });

  readonly hourLabels = computed(() => {
    const { start, end } = this.bounds();
    const labels: string[] = [];
    for (let m = start; m <= end; m += 60) {
      labels.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:00`);
    }
    return labels;
  });

  readonly bodyHeight = computed(() => {
    const { start, end } = this.bounds();
    return TOP_PAD + (end - start) * PX_PER_MIN;
  });

  readonly days = computed<DayColumn[]>(() => {
    const weekStart = this.weekStart();
    const today = new Date();
    const { start: axisStart } = this.bounds();

    return [1, 2, 3, 4, 5, 6].map((dow) => {
      const date = addDays(weekStart, dow - 1);
      const daySessions = this.sessions().filter((s) =>
        sameDay(new Date(s.startTime), date),
      );

      return {
        dow,
        shortName: WD_SHORT[dow],
        dayNumber: date.getDate(),
        isToday: sameDay(date, today),
        isWeekend: dow === 6,
        events: this.layoutDay(daySessions, axisStart),
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

  /** Position events for one day, splitting overlapping clusters into lanes. */
  private layoutDay(
    daySessions: CalendarSession[],
    axisStart: number,
  ): PositionedEvent[] {
    const sorted = [...daySessions].sort(
      (a, b) =>
        minutesOfDay(a.startTime) - minutesOfDay(b.startTime) ||
        minutesOfDay(a.endTime) - minutesOfDay(b.endTime),
    );

    const positioned: PositionedEvent[] = [];
    let cluster: CalendarSession[] = [];
    let clusterEnd = -1;

    const flush = () => {
      if (!cluster.length) return;
      const laneEnds: number[] = [];
      const laneOf = new Map<string, number>();

      for (const s of cluster) {
        const startMin = minutesOfDay(s.startTime);
        let lane = laneEnds.findIndex((end) => end <= startMin);
        if (lane === -1) {
          lane = laneEnds.length;
          laneEnds.push(0);
        }
        laneEnds[lane] = minutesOfDay(s.endTime);
        laneOf.set(s.id, lane);
      }

      const lanes = laneEnds.length;
      cluster.forEach((s, idx) => {
        const group = resolveGroup(s);
        const startMin = minutesOfDay(s.startTime);
        const endMin = minutesOfDay(s.endTime);
        const height = (endMin - startMin) * PX_PER_MIN - 4;
        const lane = laneOf.get(s.id) ?? 0;

        positioned.push({
          session: s,
          group,
          groupLabel: GROUP_META[group].label,
          vars: groupVars(group),
          top: TOP_PAD + (startMin - axisStart) * PX_PER_MIN,
          height,
          widthPct: 100 / lanes,
          leftPct: (100 / lanes) * lane,
          small: height < 58,
          startLabel: formatTime(s.startTime),
          endLabel: formatTime(s.endTime),
          delayMs: idx * 35,
        });
      });

      cluster = [];
      clusterEnd = -1;
    };

    for (const s of sorted) {
      const startMin = minutesOfDay(s.startTime);
      if (cluster.length && startMin >= clusterEnd) flush();
      cluster.push(s);
      clusterEnd = Math.max(clusterEnd, minutesOfDay(s.endTime));
    }
    flush();

    return positioned;
  }

  protected readonly hourHeight = HOUR_HEIGHT;
}
