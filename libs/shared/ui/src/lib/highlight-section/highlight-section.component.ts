// ============================================================================
// HIGHLIGHT SECTION COMPONENT
// ============================================================================
// Section zur Anzeige von hervorgehobenen/empfohlenen Kursen
// Zeigt Kurse in einer horizontalen Scroll-Ansicht
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from '../card/course-card.component';
import { CourseCardData } from '../card/course-card.types';

@Component({
  selector: 'ui-highlight-section',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './highlight-section.component.html',
  styleUrl: './highlight-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightSectionComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Highlighted Kurse */
  @Input() courses: CourseCardData[] = [];

  /** Section Headline */
  @Input() headline = 'Empfehlungen für Dich';

  /** Section Subheadline */
  @Input() subheadline = 'Was Tanzmoment aktuell bewegt';

  /** Loading State */
  @Input() loading = false;

  // ───────────────────────────────────────────────────────────────────────────
  // OUTPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Event wenn ein Kurs angeklickt wird */
  @Output() courseClicked = new EventEmitter<string>();

  /** Event wenn auf Anmelden geklickt wird */
  @Output() registerClicked = new EventEmitter<string>();

  // ───────────────────────────────────────────────────────────────────────────
  // METHODS
  // ───────────────────────────────────────────────────────────────────────────

  /** Handler für Kurs-Klick */
  onCourseClick(courseId: string): void {
    this.courseClicked.emit(courseId);
  }

  /** Handler für Anmelde-Klick */
  onRegisterClick(courseId: string): void {
    this.registerClicked.emit(courseId);
  }

  /** TrackBy für Performance */
  trackByCourse(index: number, course: CourseCardData): string {
    return course.id;
  }
}
