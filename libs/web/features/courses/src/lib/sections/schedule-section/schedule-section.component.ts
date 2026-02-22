// ============================================================================
// SCHEDULE SECTION
// ============================================================================
// Session list grouped by date with real-time availability and booking buttons.
// Emits bookSession event to parent for the booking flow.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent, IconComponent, ScrollRevealDirective } from '@tanzmoment/shared/ui';
import {
  CourseDetailData,
  CourseDetailSession,
  CourseDetailScheduleContent,
} from '../../types/course-detail.types';

interface SessionGroup {
  /** Display label e.g. "Mittwoch, 25. Februar" */
  dateLabel: string;
  /** ISO date key e.g. "2025-02-25" for tracking */
  dateKey: string;
  sessions: CourseDetailSession[];
}

@Component({
  selector: 'app-schedule-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, ScrollRevealDirective],
  templateUrl: './schedule-section.component.html',
  styleUrl: './schedule-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleSectionComponent implements OnChanges {
  @Input({ required: true }) sessions!: CourseDetailSession[];
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailScheduleContent;

  @Output() bookSession = new EventEmitter<string>();

  private readonly _sessions = signal<CourseDetailSession[]>([]);

  /** Sessions grouped by date, sorted chronologically. */
  readonly groupedSessions = computed<SessionGroup[]>(() => {
    const sessions = this._sessions();
    if (!sessions.length) return [];

    const groups = new Map<string, CourseDetailSession[]>();

    for (const session of sessions) {
      const date = new Date(session.startTime);
      const dateKey = date.toISOString().split('T')[0];
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(session);
    }

    return Array.from(groups.entries()).map(([dateKey, groupSessions]) => {
      const date = new Date(dateKey + 'T00:00:00');
      const dateLabel = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      return { dateKey, dateLabel, sessions: groupSessions };
    });
  });

  ngOnChanges(): void {
    this._sessions.set(this.sessions ?? []);
  }

  // ─── Resolved Values ────────────────────────────────────────────────────

  get headline(): string {
    return this.content?.headline ?? 'Termine & Verfügbarkeit';
  }

  get infoText(): string | undefined {
    return this.content?.infoText;
  }

  get hasSessions(): boolean {
    return this.sessions.length > 0;
  }

  getSessionLabel(sessionId: string): string | undefined {
    return this.content?.sessionLabels?.[sessionId];
  }

  getSpotsText(session: CourseDetailSession): string {
    if (session.isFullyBooked) return 'Ausgebucht';
    if (session.availableSpots <= 3) return `Nur noch ${session.availableSpots} Plätze!`;
    return `${session.availableSpots} Plätze frei`;
  }

  getSpotsClass(session: CourseDetailSession): string {
    if (session.isFullyBooked) return 'schedule-session__spots--full';
    if (session.availableSpots <= 3) return 'schedule-session__spots--low';
    return 'schedule-session__spots--available';
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  onBook(sessionId: string): void {
    this.bookSession.emit(sessionId);
  }
}
