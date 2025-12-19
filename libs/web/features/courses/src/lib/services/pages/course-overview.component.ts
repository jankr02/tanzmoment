// ============================================================================
// COURSE OVERVIEW PAGE COMPONENT
// ============================================================================
// Main page for course overview with filters, course list and pagination
// Orchestrates all UI components and services
// ============================================================================

import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

type IllustrationType = 'dog' | 'silhouette';
type IllustrationSide = 'left' | 'right';

interface CourseIllustration {
  type: IllustrationType;
  side: IllustrationSide;
  figureSrc: string;
  footprintsSrc: string;
}

// Shared UI Components
import {
  CourseCardComponent,
  CourseCardData,
  DanceStylesSectionComponent,
  FilterBarComponent,
  FilterModalComponent,
  FilterSidebarComponent,
  HelperSectionComponent,
  EmptyStateComponent,
  HighlightSectionComponent,
  DanceStyleId,
  CourseFilterState,
} from '@tanzmoment/shared/ui';

// Feature Services (relative imports to avoid circular dependency)
import { CourseFilterService } from '../../services/course-filter.service';
import { FilterUrlSyncService } from '../../services/filter-url-sync.service';

@Component({
  selector: 'app-course-overview',
  standalone: true,
  imports: [
    CommonModule,
    // UI Components
    CourseCardComponent,
    DanceStylesSectionComponent,
    FilterBarComponent,
    FilterModalComponent,
    FilterSidebarComponent,
    HelperSectionComponent,
    EmptyStateComponent,
    HighlightSectionComponent,
  ],
  templateUrl: './course-overview.component.html',
  styleUrl: './course-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent implements OnInit, OnDestroy {
  // ───────────────────────────────────────────────────────────────────────────
  // SERVICES
  // ───────────────────────────────────────────────────────────────────────────

  readonly filterService = inject(CourseFilterService);
  private readonly urlSyncService = inject(FilterUrlSyncService);
  private readonly platformId = inject(PLATFORM_ID);

  /** Nur im Browser ausführen */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VIEW REFS
  // ───────────────────────────────────────────────────────────────────────────

  @ViewChild('filterBarRef', { read: ElementRef })
  filterBarRef!: ElementRef<HTMLElement>;

  // ───────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ───────────────────────────────────────────────────────────────────────────

  /** Mobile Filter Modal offen */
  readonly isFilterModalOpen = signal(false);

  /** Scroll-Position für Back-to-Top */
  readonly showBackToTop = signal(false);

  // ───────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ───────────────────────────────────────────────────────────────────────────

  /** Kurse für Anzeige (transformiert für CourseCard) */
  readonly courses = computed<CourseCardData[]>(() =>
    this.filterService.courses().map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortDescription: course.shortDescription,
      danceStyle: course.danceStyle,
      imageUrl: course.imageUrl,
      price: course.price,
      priceFormatted: course.priceFormatted,
      isHighlighted: course.isHighlighted,
      availableSpots: course.availableSpots,
      dateTime: course.nextSession?.startsAt ?? '',
      location: course.nextSession?.location ?? '',
    }))
  );

  /** Highlighted Kurse für Anzeige */
  readonly highlightedCourses = computed<CourseCardData[]>(() =>
    this.filterService.highlightedCourses().map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortDescription: course.shortDescription,
      danceStyle: course.danceStyle,
      imageUrl: course.imageUrl,
      price: course.price,
      priceFormatted: course.priceFormatted,
      isHighlighted: course.isHighlighted,
      availableSpots: course.availableSpots,
      dateTime: course.nextSession?.startsAt ?? '',
      location: course.nextSession?.location ?? '',
    }))
  );

  /** Loading State für Highlighted Kurse */
  readonly highlightedLoading = this.filterService.highlightedLoading;

  /** Loading State */
  readonly isLoading = this.filterService.isLoading;
  readonly isInitialLoading = this.filterService.isInitialLoading;
  readonly isLoadingMore = this.filterService.isLoadingMore;

  /** Pagination */
  readonly hasMore = this.filterService.hasMore;
  readonly totalCourses = this.filterService.totalCourses;

  /** Filter State */
  readonly filterState = this.filterService.filterState;
  readonly hasFilters = this.filterService.hasFilters;
  readonly filterCount = this.filterService.filterCount;

  /** Empty State */
  readonly isEmpty = this.filterService.isEmpty;

  /** Error State */
  readonly error = this.filterService.error;

  /** Anzahl Skeleton-Cards für Loading */
  readonly skeletonCount = computed(() => {
    if (this.isInitialLoading()) return 4;
    if (this.isLoadingMore()) return 2;
    return 0;
  });

  /** Ergebnis-Text */
  readonly resultText = computed(() => {
    const total = this.totalCourses();
    if (total === 0) return '';
    if (total === 1) return '1 Kurs gefunden';
    return `${total} Kurse gefunden`;
  });

  /** Animation State: Triggert Stacking-Animation wenn Kurse geladen sind */
  readonly shouldAnimateCards = computed(() => {
    // Animation nur wenn nicht mehr initial geladen wird und Kurse vorhanden sind
    return !this.isInitialLoading() && this.courses().length > 0;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ILLUSTRATION CONFIG
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly illustrationAssets = {
    dog: {
      figure: 'assets/images/subtle-elements/dog.svg',
      footprints: 'assets/images/subtle-elements/dog%20footprints.svg',
    },
    silhouette: {
      figure: 'assets/images/subtle-elements/sillhouette%201.svg',
      footprints: 'assets/images/subtle-elements/sillhouette%201%20footprints.svg',
    },
  };

  /**
   * Berechnet die Illustrationen für jede Kurs-Card basierend auf:
   * - Bei 1 Kurs: nur Hund + Footprints
   * - Bei 2+ Kursen: abwechselnd Hund und Silhouette
   * - Seite wechselt für visuelles Interesse
   */
  readonly courseIllustrations = computed<Map<string, CourseIllustration>>(
    () => {
      const courseList = this.courses();
      const illustrationMap = new Map<string, CourseIllustration>();

      if (courseList.length === 0) {
        return illustrationMap;
      }

      // Bei nur einem Kurs: immer Hund auf der rechten Seite
      if (courseList.length === 1) {
        illustrationMap.set(courseList[0].id, {
          type: 'dog',
          side: 'right',
          figureSrc: this.illustrationAssets.dog.figure,
          footprintsSrc: this.illustrationAssets.dog.footprints,
        });
        return illustrationMap;
      }

      // Bei mehreren Kursen: sparsame Verteilung
      // Nur ausgewählte Kurse bekommen Illustrationen
      let illustrationCount = 0;

      courseList.forEach((course, index) => {
        // Zeige Illustration nur bei bestimmten Positionen:
        // - Erste Karte (Index 0): immer Hund
        // - Dritte Karte (Index 2): Silhouette (wenn vorhanden)
        // - Danach: nur noch vereinzelt (ca. jede 3. Karte)
        const showAtIndex =
          index === 0 ||
          index === 2 ||
          (index >= 5 && (index - 5) % 3 === 0);

        if (!showAtIndex) return;

        // Maximal 4 Illustrationen insgesamt
        if (illustrationCount >= 4) return;

        // Alterniere zwischen Hund und Silhouette
        const type: IllustrationType =
          illustrationCount % 2 === 0 ? 'dog' : 'silhouette';

        // Wechsle die Seite für visuelles Interesse
        const side: IllustrationSide =
          illustrationCount % 2 === 0 ? 'right' : 'left';

        illustrationMap.set(course.id, {
          type,
          side,
          figureSrc: this.illustrationAssets[type].figure,
          footprintsSrc: this.illustrationAssets[type].footprints,
        });

        illustrationCount++;
      });

      return illustrationMap;
    }
  );

  /**
   * Helper für Template: Holt Illustration für einen Kurs
   */
  getIllustration(courseId: string): CourseIllustration | undefined {
    return this.courseIllustrations().get(courseId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // URL-Sync aktivieren (liest Filter aus URL oder triggert Initial Load)
    this.urlSyncService.activate();

    // Highlighted Kurse laden
    this.filterService.loadHighlightedCourses();

    // Scroll-Listener für Back-to-Top Button
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.urlSyncService.deactivate();
    this.removeScrollListener();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Dance Style aus Hero-Section ausgewählt
   */
  onDanceStyleSelected(styleId: DanceStyleId): void {
    this.filterService.setDanceStyle(styleId);
    this.scrollToResults();
  }

  /**
   * Filter geändert (von FilterBar, Modal oder Sidebar)
   */
  onFilterChange(filter: CourseFilterState): void {
    this.filterService.setFilter(filter);
  }

  /**
   * Mobile Filter Modal öffnen
   */
  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Mobile Filter Modal schließen
   */
  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Filter anwenden (aus Modal)
   */
  applyFilterFromModal(filter: CourseFilterState): void {
    this.filterService.setFilter(filter);
    this.closeFilterModal();
  }

  /**
   * Mehr Kurse laden
   */
  loadMore(): void {
    this.filterService.loadMore();
  }

  /**
   * Filter zurücksetzen
   */
  clearFilters(): void {
    this.filterService.clearFilters();
  }

  /**
   * Erneut laden (bei Fehler)
   */
  retry(): void {
    this.filterService.refresh();
  }

  /**
   * Helper Card Click
   */
  onHelperCardClick(event: { cardId: string; action: string }): void {
    switch (event.action) {
      case 'open-newsletter-modal':
        // TODO: Open newsletter modal
        break;
      case 'contact':
        // Navigate to contact
        break;
    }
  }

  /**
   * Back to Top
   */
  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Scroll zu Ergebnissen
   */
  scrollToResults(): void {
    if (!this.isBrowser) return;

    const filterBar = this.filterBarRef?.nativeElement;
    if (filterBar) {
      const offset = 20;
      const top =
        filterBar.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ───────────────────────────────────────────────────────────────────────────

  private scrollHandler = (): void => {
    if (this.isBrowser) {
      this.showBackToTop.set(window.scrollY > 400);
    }
  };

  private setupScrollListener(): void {
    if (this.isBrowser) {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
  }

  private removeScrollListener(): void {
    if (this.isBrowser) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /**
   * TrackBy für Course-Liste
   */
  trackByCourse(index: number, course: CourseCardData): string {
    return course.id;
  }
}
