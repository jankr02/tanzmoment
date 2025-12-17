// ============================================================================
// DANCE STYLES SECTION COMPONENT - V2 (Asymmetric Layout)
// ============================================================================
// Section mit Hintergrundbild und asymmetrisch positionierten Karten
// Zeigt alle 4 Tanzstile in einem kreativen, schwebenden Layout
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DanceStyleCardComponent } from '../dance-style-card/dance-style-card.component';
import {
  DanceStyleCardData,
  DanceStyleId,
  DanceStyleNavigationMode,
  DEFAULT_DANCE_STYLES,
} from '../dance-style-card/dance-style-card.types';

// Re-export types
export type {
  DanceStyleId,
  DanceStyleCardData,
  DanceStyleNavigationMode,
} from '../dance-style-card/dance-style-card.types';

@Component({
  selector: 'ui-dance-styles-section',
  standalone: true,
  imports: [CommonModule, DanceStyleCardComponent],
  templateUrl: './dance-styles-section.component.html',
  styleUrl: './dance-styles-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DanceStylesSectionComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Dance Styles Daten */
  @Input() danceStyles: DanceStyleCardData[] = DEFAULT_DANCE_STYLES;

  /** URL zum Hintergrundbild */
  @Input() backgroundImageUrl = '/assets/images/dance-styles-bg.jpg';

  /** Alt-Text für Hintergrundbild */
  @Input() backgroundImageAlt = 'Tanzende Personen im Studio';

  /** Section Headline */
  @Input() headline = 'Welche Tanzwelt passt zu Dir?';

  /** Section Subheadline (optional) */
  @Input() subheadline = 'Vier einzigartige Wege, Bewegung und Ausdruck zu erleben';

  /** Zeigt Kurs-Anzahl auf den Cards */
  @Input() showCourseCounts = true;

  /** Navigation-Modus für alle Cards: 'emit' (Event) oder 'navigate' (Router) */
  @Input() navigationMode: DanceStyleNavigationMode = 'emit';

  // ───────────────────────────────────────────────────────────────────────────
  // OUTPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Event wenn ein Tanzstil ausgewählt wird */
  @Output() styleSelected = new EventEmitter<DanceStyleId>();

  // ───────────────────────────────────────────────────────────────────────────
  // METHODS
  // ───────────────────────────────────────────────────────────────────────────

  /** Holt die Daten für einen bestimmten Tanzstil */
  getStyleData(styleId: DanceStyleId): DanceStyleCardData {
    const style = this.danceStyles.find((s) => s.id === styleId);
    return style ?? DEFAULT_DANCE_STYLES.find((s) => s.id === styleId)!;
  }

  /** Handler für Klick auf eine Dance Style Card */
  onCardClick(styleId: DanceStyleId): void {
    this.styleSelected.emit(styleId);
  }
}
