// ============================================================================
// SCHEDULE DETAIL PANEL
// ============================================================================
// Slide-in overlay with course details and enrollment actions.
// ============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconComponent } from '@tanzmoment/shared/ui';

import {
  CalendarSession,
  GROUP_META,
  GroupKey,
  LEVEL_LABELS,
  WD_LONG,
  formatDuration,
  formatTime,
  groupVars,
  isoDow,
  resolveGroup,
} from '../../pages/course-schedule/course-schedule.types';

interface PanelFact {
  icon: 'calendar' | 'clock' | 'sparkle' | 'map-pin' | 'users';
  key: string;
  value: string;
}

@Component({
  selector: 'tm-schedule-detail-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './schedule-detail-panel.component.html',
  styleUrl: './schedule-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleDetailPanelComponent {
  readonly session = input<CalendarSession | null>(null);
  readonly close = output<void>();
  readonly enroll = output<CalendarSession>();
  readonly details = output<CalendarSession>();

  /** Retains the last session so content stays visible during the close animation. */
  private readonly retained = signal<CalendarSession | null>(null);

  constructor() {
    effect(() => {
      const current = this.session();
      if (current) this.retained.set(current);
    });
  }

  readonly isOpen = computed(() => this.session() !== null);
  readonly course = computed(() => this.retained());

  readonly group = computed<GroupKey | null>(() => {
    const s = this.retained();
    return s ? resolveGroup(s) : null;
  });

  readonly groupMeta = computed(() => {
    const g = this.group();
    return g ? GROUP_META[g] : null;
  });

  readonly vars = computed(() => {
    const g = this.group();
    return g ? groupVars(g) : {};
  });

  readonly facts = computed<PanelFact[]>(() => {
    const s = this.retained();
    if (!s) return [];
    return [
      { icon: 'calendar', key: 'Wochentag', value: WD_LONG[isoDow(new Date(s.startTime))] },
      { icon: 'clock', key: 'Uhrzeit', value: `${formatTime(s.startTime)}–${formatTime(s.endTime)}` },
      { icon: 'sparkle', key: 'Dauer', value: formatDuration(s.startTime, s.endTime) },
      { icon: 'map-pin', key: 'Ort', value: s.location },
      { icon: 'users', key: 'Leitung', value: s.course.instructorName },
      { icon: 'sparkle', key: 'Für', value: LEVEL_LABELS[s.course.level] ?? s.course.targetGroup },
    ];
  });

  protected onClose(): void {
    this.close.emit();
  }

  protected onEnroll(): void {
    const s = this.retained();
    if (s) this.enroll.emit(s);
  }

  protected onDetails(): void {
    const s = this.retained();
    if (s) this.details.emit(s);
  }
}
