// ============================================================================
// COURSE SCHEDULE PAGE (KURSPLAN)
// ============================================================================
// Full-page course-schedule calendar with week / list / month views,
// target-group filtering and a slide-in detail panel. Reads real sessions
// from the API for the navigated date range.
// ============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { IconComponent } from '@tanzmoment/shared/ui';
import { SeoService } from '@tanzmoment/shared/services';

import { CourseScheduleService } from '../../services/course-schedule.service';
import { ScheduleWeekViewComponent } from '../../sections/schedule-week-view/schedule-week-view.component';
import { ScheduleListViewComponent } from '../../sections/schedule-list-view/schedule-list-view.component';
import { ScheduleMonthViewComponent } from '../../sections/schedule-month-view/schedule-month-view.component';
import { ScheduleDetailPanelComponent } from '../../sections/schedule-detail-panel/schedule-detail-panel.component';
import {
  CalendarSession,
  GROUP_META,
  GROUP_ORDER,
  GroupKey,
  MONTHS,
  addDays,
  endOfDay,
  resolveGroup,
  startOfWeek,
} from './course-schedule.types';

type ScheduleView = 'woche' | 'liste' | 'monat';

interface FilterChip {
  key: GroupKey;
  long: string;
  active: boolean;
  background: string | null;
  dotColor: string;
}

@Component({
  selector: 'tm-course-schedule',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IconComponent,
    ScheduleWeekViewComponent,
    ScheduleListViewComponent,
    ScheduleMonthViewComponent,
    ScheduleDetailPanelComponent,
  ],
  templateUrl: './course-schedule.component.html',
  styleUrl: './course-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseScheduleComponent implements OnInit {
  private readonly scheduleService = inject(CourseScheduleService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ───────────────────────────────────────────────────────────────────────────
  // STATE
  // ───────────────────────────────────────────────────────────────────────────

  readonly view = signal<ScheduleView>('woche');
  readonly groups = signal<Set<GroupKey>>(new Set());
  readonly weekOffset = signal(0);
  readonly monthOffset = signal(0);
  readonly selected = signal<CalendarSession | null>(null);

  private readonly today = new Date();

  readonly isLoading = this.scheduleService.isLoading;
  readonly error = this.scheduleService.error;

  // ───────────────────────────────────────────────────────────────────────────
  // DERIVED
  // ───────────────────────────────────────────────────────────────────────────

  readonly isMonth = computed(() => this.view() === 'monat');

  readonly weekStart = computed(() =>
    addDays(startOfWeek(this.today), this.weekOffset() * 7),
  );

  readonly monthDate = computed(
    () =>
      new Date(this.today.getFullYear(), this.today.getMonth() + this.monthOffset(), 1),
  );

  /** Visible date range to fetch — drives the data effect (group filter is client-side). */
  private readonly dateRange = computed(() => {
    if (this.isMonth()) {
      const gridStart = startOfWeek(this.monthDate());
      return { from: gridStart, to: endOfDay(addDays(gridStart, 41)) };
    }
    const start = this.weekStart();
    return { from: start, to: endOfDay(addDays(start, 5)) };
  });

  readonly filteredSessions = computed<CalendarSession[]>(() => {
    const active = this.groups();
    const all = this.scheduleService.sessions();
    if (!active.size) return all;
    return all.filter((s) => active.has(resolveGroup(s)));
  });

  readonly filterChips = computed<FilterChip[]>(() => {
    const active = this.groups();
    return GROUP_ORDER.map((key) => ({
      key,
      long: GROUP_META[key].long,
      active: active.has(key),
      background: active.has(key) ? `var(--group-${key}-edge)` : null,
      dotColor: active.has(key) ? '#fff' : `var(--group-${key}-edge)`,
    }));
  });

  readonly allActive = computed(() => this.groups().size === 0);

  readonly navLabel = computed(() => {
    if (this.isMonth()) {
      const m = this.monthDate();
      return `${MONTHS[m.getMonth()]} ${m.getFullYear()}`;
    }
    const start = this.weekStart();
    const end = addDays(start, 5);
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}.–${end.getDate()}. ${MONTHS[start.getMonth()]}`;
    }
    return `${start.getDate()}. ${MONTHS[start.getMonth()].slice(0, 3)} – ${end.getDate()}. ${MONTHS[
      end.getMonth()
    ].slice(0, 3)}`;
  });

  readonly navSub = computed(() =>
    this.isMonth() ? 'Monatsansicht' : `Woche · ${this.weekStart().getFullYear()}`,
  );

  constructor() {
    effect(() => {
      const { from, to } = this.dateRange();
      if (this.isBrowser) this.scheduleService.loadRange(from, to);
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Kursplan — Alle Termine auf einen Blick',
      description:
        'Alle Tanzkurse von Tanzmoment in der Wochen-, Listen- und Monatsansicht. Finde deinen Moment für Bewegung und melde dich direkt an.',
      url: '/kursplan',
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selected()) this.selected.set(null);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ───────────────────────────────────────────────────────────────────────────

  setView(view: ScheduleView): void {
    this.view.set(view);
  }

  selectAllGroups(): void {
    this.groups.set(new Set());
  }

  toggleGroup(key: GroupKey): void {
    const next = new Set(this.groups());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.groups.set(next);
  }

  navPrev(): void {
    if (this.isMonth()) {
      this.monthOffset.update((o) => o - 1);
    } else {
      this.weekOffset.update((o) => o - 1);
    }
  }

  navNext(): void {
    if (this.isMonth()) {
      this.monthOffset.update((o) => o + 1);
    } else {
      this.weekOffset.update((o) => o + 1);
    }
  }

  navToday(): void {
    if (this.isMonth()) {
      this.monthOffset.set(0);
    } else {
      this.weekOffset.set(0);
    }
  }

  openDetail(session: CalendarSession): void {
    this.selected.set(session);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  goToCourse(session: CalendarSession): void {
    this.router.navigate(['/courses', session.course.slug]);
  }
}
