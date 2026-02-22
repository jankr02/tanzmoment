// ============================================================================
// SCHEDULE SECTION
// ============================================================================
// Session list with real-time availability and booking buttons.
// Emits bookSession event to parent for the booking flow.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from '@tanzmoment/shared/ui';
import {
  CourseDetailData,
  CourseDetailSession,
  CourseDetailScheduleContent,
} from '../../types/course-detail.types';

@Component({
  selector: 'app-schedule-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './schedule-section.component.html',
  styleUrl: './schedule-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleSectionComponent {
  @Input({ required: true }) sessions!: CourseDetailSession[];
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailScheduleContent;

  @Output() bookSession = new EventEmitter<string>();

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
