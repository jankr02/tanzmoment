// ============================================================================
// DANCE STYLES SECTION COMPONENT - V2 (Asymmetric Layout)
// ============================================================================
// Section mit Hintergrundbild und asymmetrisch positionierten Karten
// Zeigt alle 4 Tanzstile in einem kreativen, schwebenden Layout
// ============================================================================

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DanceStyleCardComponent } from '../dance-style-card/dance-style-card.component';
import { DanceStylesJourneyComponent } from '../dance-styles-journey/dance-styles-journey.component';
import {
  DANCE_STYLE_JOURNEY_FIRST_BG,
  DANCE_STYLE_JOURNEY_ORDER,
  DANCE_STYLE_JOURNEY_THEMES,
} from '../dance-styles-journey/dance-styles-journey.types';
import { WaveDividerComponent } from '../wave-divider';
import { SectionBackground } from '../wave-divider/wave-divider.types';
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
  imports: [
    CommonModule,
    DanceStyleCardComponent,
    DanceStylesJourneyComponent,
    WaveDividerComponent,
  ],
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

  /**
   * Background der Section ÜBER der Journey (mobile only).
   * Steuert den Wave-Übergang in die erste Scene (Kids, sage green).
   */
  @Input() previousSectionBackground: SectionBackground | string = 'surface';

  /**
   * Background der Section UNTER der Journey (mobile only).
   * Steuert den Wave-Übergang aus der letzten Scene (Accessible, olive).
   */
  @Input() nextSectionBackground: SectionBackground | string = 'surface';

  /**
   * Whether the TOP boundary wave tracks the journey's active scene.
   * - `true` (default): the wave's journey-side edge follows the active scene —
   *   useful when the journey sits at the top of the page (e.g. course
   *   overview) so the transition feels seamless.
   * - `false`: the top wave stays anchored to the first scene (kids). Use this
   *   when the journey sits between other sections (e.g. about page) — the
   *   fixed colour reads as a stable entry point instead of jumping with inner
   *   scroll.
   *
   * The BOTTOM boundary wave always tracks the active scene: its fill reveals
   * the *next* scene's colour as a peek (or `nextSectionBackground` when the
   * active scene is the last one).
   */
  @Input() boundaryWavesFollowActive = true;

  /** First scene background — start of the journey color flow. */
  protected readonly journeyFirstBg = DANCE_STYLE_JOURNEY_FIRST_BG;

  /**
   * Tracks the journey's currently active scene so the boundary waves can
   * follow whatever colour is exposed at the journey's top/bottom edge as
   * the user scroll-snaps between scenes.
   */
  protected readonly activeJourneyStyle = signal<DanceStyleId>(
    DANCE_STYLE_JOURNEY_ORDER[0],
  );

  /** Background of the currently visible scene. */
  protected readonly activeJourneyBg = computed(
    () => DANCE_STYLE_JOURNEY_THEMES[this.activeJourneyStyle()].bg,
  );

  /** Resolved colour for the TOP boundary wave's journey-side edge. */
  protected readonly topBoundaryBg = computed(() =>
    this.boundaryWavesFollowActive ? this.activeJourneyBg() : this.journeyFirstBg,
  );

  /**
   * Fill colour for the BOTTOM boundary wave — the scene that comes *after*
   * the active one, so the wave feels like a peek into what's next. When the
   * active scene is the last one, falls back to `nextSectionBackground` so the
   * wave transitions out of the journey into the page below.
   */
  protected readonly nextBoundaryBg = computed<SectionBackground | string>(
    () => {
      const order = DANCE_STYLE_JOURNEY_ORDER;
      const activeIdx = order.indexOf(this.activeJourneyStyle());
      const nextId = order[activeIdx + 1];
      if (!nextId) return this.nextSectionBackground;
      return DANCE_STYLE_JOURNEY_THEMES[nextId].bg;
    },
  );

  /** Wire-up for the journey's `(activeStyleChange)` output. */
  onActiveStyleChange(styleId: DanceStyleId): void {
    this.activeJourneyStyle.set(styleId);
  }

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
