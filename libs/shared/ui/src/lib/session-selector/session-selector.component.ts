// ============================================================================
// SESSION SELECTOR COMPONENT
// ============================================================================
// Displays available sessions with real-time availability.
// Works identically for guests and authenticated users.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { SessionAvailability } from '@tanzmoment/shared/types';

@Component({
  selector: 'ui-session-selector',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './session-selector.component.html',
  styleUrl: './session-selector.component.scss',
})
export class SessionSelectorComponent {
  @Input({ required: true }) sessions: SessionAvailability[] = [];
  @Output() sessionSelected = new EventEmitter<SessionAvailability>();

  readonly selectedSessionId = signal<string | null>(null);

  selectSession(session: SessionAvailability): void {
    if (session.userHasBooking) return;
    this.selectedSessionId.set(session.id);
    this.sessionSelected.emit(session);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DATE FORMATTING (German locale)
  // ──────────────────────────────────────────────────────────────────────────

  formatWeekday(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short' });
  }

  formatDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  formatMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', { month: 'short' });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getSessionAriaLabel(session: SessionAvailability): string {
    const date = new Date(session.startTime).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return `${date} um ${this.formatTime(session.startTime)}, ${session.availableSpots} Plätze frei, ${session.location}`;
  }
}
