// ============================================================================
// QUICK FACTS SECTION
// ============================================================================
// Compact overview of key course data.
// Generates standard facts from course data, allows CMS overrides.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';

import {
  CourseDetailData,
  CourseDetailQuickFactsContent,
} from '../../types/course-detail.types';
import { QuickFactType, CustomFact } from '@tanzmoment/shared/types';

// ─── Display-Type ─────────────────────────────────────────────────────────────

interface QuickFactDisplay {
  /** Fact type (for sorting/filtering) */
  type: QuickFactType | 'custom';
  /** Icon name from the shared IconComponent registry */
  icon: string;
  /** Label above the value */
  label: string;
  /** Displayed value */
  value: string;
}

// ─── Level-Label Mapping ──────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Anfänger',
  INTERMEDIATE: 'Fortgeschritten',
  ADVANCED: 'Profi',
  ALL_LEVELS: 'Alle Levels',
};

@Component({
  selector: 'app-quick-facts',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './quick-facts.component.html',
  styleUrl: './quick-facts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickFactsComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailQuickFactsContent;

  /**
   * Generates the final facts list:
   * 1. Create standard facts from course data
   * 2. Filter hidden facts
   * 3. Apply fact order (if defined)
   * 4. Append custom facts
   */
  get facts(): QuickFactDisplay[] {
    // ── 1. Standard Facts ─────────────────────────────────────────────────
    const standardFacts: QuickFactDisplay[] = [
      {
        type: 'price',
        icon: 'euro',
        label: 'Preis',
        value: this.course.priceFormatted,
      },
      {
        type: 'duration',
        icon: 'clock',
        label: 'Dauer',
        value: `${this.course.duration} Min.`,
      },
      {
        type: 'level',
        icon: 'bar-chart',
        label: 'Niveau',
        value: LEVEL_LABELS[this.course.level] ?? this.course.level,
      },
      {
        type: 'location',
        icon: 'map-pin',
        label: 'Ort',
        value: this.course.sessions[0]?.location ?? '–',
      },
      {
        type: 'nextDate',
        icon: 'calendar',
        label: 'Nächster Termin',
        value: this.course.sessions[0]?.formattedDate ?? 'Keine Termine',
      },
      {
        type: 'spotsAvailable',
        icon: 'users',
        label: 'Freie Plätze',
        value: `${this.course.availableSpots} / ${this.course.maxParticipants}`,
      },
    ];

    // ── 2. Filter Hidden Facts ───────────────────────────────────────────
    const hidden = new Set(this.content?.hiddenFacts ?? []);
    let filtered = standardFacts.filter((f) => !hidden.has(f.type as QuickFactType));

    // ── 3. Apply Ordering ────────────────────────────────────────────────
    if (this.content?.factOrder?.length) {
      const orderMap = new Map(
        this.content.factOrder.map((type, idx) => [type, idx])
      );
      const ordered: QuickFactDisplay[] = [];
      const remaining: QuickFactDisplay[] = [];

      for (const fact of filtered) {
        if (orderMap.has(fact.type as QuickFactType)) {
          ordered.push(fact);
        } else {
          remaining.push(fact);
        }
      }

      // Sort ordered by factOrder sequence
      ordered.sort(
        (a, b) =>
          (orderMap.get(a.type as QuickFactType) ?? 99) -
          (orderMap.get(b.type as QuickFactType) ?? 99)
      );

      filtered = [...ordered, ...remaining];
    }

    // ── 4. Append Custom Facts ──────────────────────────────────────────
    const customFacts: QuickFactDisplay[] = (
      this.content?.customFacts ?? []
    ).map((cf: CustomFact) => ({
      type: 'custom' as const,
      icon: cf.icon,
      label: cf.label,
      value: cf.value,
    }));

    return [...filtered, ...customFacts];
  }
}
