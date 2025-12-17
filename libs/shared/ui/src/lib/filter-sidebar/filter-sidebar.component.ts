import {
  Component,
  input,
  output,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostBinding,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { German } from 'flatpickr/dist/l10n/de';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import {
  CourseFilterState,
  DanceStyleId,
  LocationId,
  DANCE_STYLE_OPTIONS,
  LOCATION_OPTIONS,
  EMPTY_FILTER_STATE,
  hasActiveFilters,
  countActiveFilters,
} from '../filter-bar/filter-bar.types';

/**
 * Filter Sidebar Component
 *
 * Vertical sticky sidebar for desktop filter controls.
 * Appears when the horizontal filter-bar scrolls out of viewport.
 *
 * Features:
 * - Sticky positioning with smooth fade-in
 * - Synchronized state with filter-bar
 * - Collapsible filter sections
 * - Active filter count badge
 * - Intersection Observer for visibility toggle
 *
 * @example
 * ```html
 * <ui-filter-sidebar
 *   [filterState]="currentFilter()"
 *   [triggerElement]="filterBarRef"
 *   [loading]="isLoading()"
 *   (filterChange)="onFilterChange($event)"
 * />
 * ```
 *
 * @selector ui-filter-sidebar
 * @standalone true
 */
@Component({
  selector: 'ui-filter-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss',
})
export class FilterSidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);

  // ==========================================================================
  // View Children (Date Inputs)
  // ==========================================================================

  @ViewChild('sidebarDateFromInput') dateFromInput!: ElementRef<HTMLInputElement>;
  @ViewChild('sidebarDateToInput') dateToInput!: ElementRef<HTMLInputElement>;

  // ==========================================================================
  // Flatpickr Instances
  // ==========================================================================

  private flatpickrFrom: FlatpickrInstance | null = null;
  private flatpickrTo: FlatpickrInstance | null = null;
  private flatpickrInitialized = false;

  // ==========================================================================
  // Inputs (Signal-based)
  // ==========================================================================

  /** Current filter state (synced with filter-bar) */
  readonly filterState = input<CourseFilterState>(EMPTY_FILTER_STATE);

  /** Reference to trigger element (filter-bar) for intersection observer */
  readonly triggerElement = input<HTMLElement | null>(null);

  /** Offset from top when sticky (in pixels) */
  readonly stickyOffset = input<number>(100);

  /** Disable all interactions */
  readonly disabled = input<boolean>(false);

  /** Show loading state */
  readonly loading = input<boolean>(false);

  // ==========================================================================
  // Outputs
  // ==========================================================================

  /** Emitted when any filter changes */
  readonly filterChange = output<CourseFilterState>();

  /** Emitted when clear all is clicked */
  readonly clearAll = output<void>();

  // ==========================================================================
  // Internal State
  // ==========================================================================

  /** Whether sidebar is visible (trigger element out of viewport) */
  readonly isVisible = signal<boolean>(false);

  /** Whether the entire sidebar is collapsed (minimized) */
  readonly isCollapsed = signal<boolean>(false);

  /** Collapsed state for each section */
  readonly collapsedSections = signal<Record<string, boolean>>({
    danceStyle: false,
    location: false,
    dateRange: false,
  });

  /** Intersection Observer instance */
  private intersectionObserver: IntersectionObserver | null = null;

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  /** Check if any filters are active */
  readonly hasFilters = computed(() => hasActiveFilters(this.filterState()));

  /** Count of active filters */
  readonly activeFilterCount = computed(() =>
    countActiveFilters(this.filterState())
  );

  /** Dance style options for template */
  readonly danceStyleOptions = DANCE_STYLE_OPTIONS;

  /** Location options for template */
  readonly locationOptions = LOCATION_OPTIONS;

  // ==========================================================================
  // Host Bindings
  // ==========================================================================

  @HostBinding('class.filter-sidebar') readonly hostClass = true;

  @HostBinding('class.filter-sidebar--visible')
  get isVisibleClass(): boolean {
    return this.isVisible();
  }

  @HostBinding('class.filter-sidebar--disabled')
  get isDisabledClass(): boolean {
    return this.disabled();
  }

  @HostBinding('class.filter-sidebar--loading')
  get isLoadingClass(): boolean {
    return this.loading();
  }

  @HostBinding('class.filter-sidebar--collapsed')
  get isCollapsedClass(): boolean {
    return this.isCollapsed();
  }

  @HostBinding('style.--sticky-offset')
  get stickyOffsetStyle(): string {
    return `${this.stickyOffset()}px`;
  }

  @HostBinding('attr.role') readonly role = 'complementary';

  @HostBinding('attr.aria-label') readonly ariaLabel = 'Kursfilter';

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  ngOnInit(): void {
    this.setupIntersectionObserver();
  }

  ngAfterViewInit(): void {
    // Flatpickr is now initialized when sidebar becomes visible via Intersection Observer
  }

  ngOnDestroy(): void {
    this.cleanupIntersectionObserver();
    this.destroyFlatpickr();
  }

  // ==========================================================================
  // Intersection Observer Setup
  // ==========================================================================

  /**
   * Setup Intersection Observer to track filter-bar visibility
   */
  private setupIntersectionObserver(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Create observer that triggers when element leaves viewport
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show sidebar when trigger element is NOT intersecting (scrolled out)
          const wasVisible = this.isVisible();
          const isNowVisible = !entry.isIntersecting;
          this.isVisible.set(isNowVisible);

          // Initialize Flatpickr when sidebar becomes visible for the first time
          if (!wasVisible && isNowVisible && !this.flatpickrInitialized) {
            setTimeout(() => this.initFlatpickr(), 50);
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '-100px 0px 0px 0px', // trigger slightly before fully out
        threshold: 0,
      }
    );

    // Observe trigger element if provided, otherwise use a default behavior
    const trigger = this.triggerElement();
    if (trigger) {
      this.intersectionObserver.observe(trigger);
    }
  }

  /**
   * Cleanup observer on destroy
   */
  private cleanupIntersectionObserver(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  // ==========================================================================
  // Sidebar Collapse Toggle
  // ==========================================================================

  /**
   * Toggle collapsed state for the entire sidebar
   */
  toggleCollapse(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  // ==========================================================================
  // Section Toggle
  // ==========================================================================

  /**
   * Toggle collapsed state for a section
   */
  toggleSection(section: string): void {
    this.collapsedSections.update((state) => ({
      ...state,
      [section]: !state[section],
    }));
  }

  /**
   * Check if section is collapsed
   */
  isSectionCollapsed(section: string): boolean {
    return this.collapsedSections()[section] ?? false;
  }

  // ==========================================================================
  // Filter Actions
  // ==========================================================================

  /**
   * Set dance style filter
   */
  setDanceStyle(styleId: DanceStyleId | null): void {
    if (this.disabled()) return;

    const currentState = this.filterState();
    const newValue = currentState.danceStyle === styleId ? null : styleId;

    this.filterChange.emit({
      ...currentState,
      danceStyle: newValue,
    });
  }

  /**
   * Set location filter
   */
  setLocation(locationId: LocationId | null): void {
    if (this.disabled()) return;

    const currentState = this.filterState();
    const newValue = currentState.location === locationId ? null : locationId;

    this.filterChange.emit({
      ...currentState,
      location: newValue,
    });
  }

  /**
   * Clear all filters
   */
  onClearAll(): void {
    if (this.disabled()) return;

    this.filterChange.emit(EMPTY_FILTER_STATE);
    this.clearAll.emit();
  }

  // ==========================================================================
  // Template Helpers
  // ==========================================================================

  /**
   * Check if dance style is selected
   */
  isDanceStyleSelected(styleId: DanceStyleId): boolean {
    return this.filterState().danceStyle === styleId;
  }

  /**
   * Check if location is selected
   */
  isLocationSelected(locationId: LocationId): boolean {
    return this.filterState().location === locationId;
  }

  /**
   * Force show sidebar (for debugging/testing)
   */
  forceShow(): void {
    this.isVisible.set(true);
  }

  /**
   * Force hide sidebar (for debugging/testing)
   */
  forceHide(): void {
    this.isVisible.set(false);
  }

  // ==========================================================================
  // Date Range Filter
  // ==========================================================================

  /**
   * Get formatted date label for display
   */
  get dateRangeLabel(): string {
    const { dateFrom, dateTo } = this.filterState();
    if (!dateFrom && !dateTo) return '';
    if (dateFrom && dateTo) {
      return `${this.formatDateShort(dateFrom)} - ${this.formatDateShort(dateTo)}`;
    }
    if (dateFrom) return `Ab ${this.formatDateShort(dateFrom)}`;
    if (dateTo) return `Bis ${this.formatDateShort(dateTo)}`;
    return '';
  }

  /**
   * Check if any date filter is active
   */
  get hasDateFilter(): boolean {
    const { dateFrom, dateTo } = this.filterState();
    return !!(dateFrom || dateTo);
  }

  /**
   * Clear date range filter
   */
  clearDateRange(): void {
    if (this.disabled()) return;

    // Clear Flatpickr instances
    this.flatpickrFrom?.clear();
    this.flatpickrTo?.clear();

    const currentState = this.filterState();
    this.filterChange.emit({
      ...currentState,
      dateFrom: null,
      dateTo: null,
    });
  }

  // ==========================================================================
  // Flatpickr Initialization
  // ==========================================================================

  /**
   * Initialize Flatpickr for both date inputs
   */
  private initFlatpickr(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.flatpickrInitialized) return;

    const commonConfig = {
      locale: German,
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd.m.Y',
      disableMobile: true,
      minDate: 'today' as const,
      allowInput: false,
      clickOpens: true,
      monthSelectorType: 'dropdown' as const,
      animate: true,
      static: true, // Position relative to input, scrolls with page
    };

    // "Von" Date Picker
    if (this.dateFromInput?.nativeElement) {
      this.flatpickrFrom = flatpickr(this.dateFromInput.nativeElement, {
        ...commonConfig,
        onChange: (selectedDates) => {
          const dateStr = selectedDates[0]
            ? this.formatDateISO(selectedDates[0])
            : null;

          const currentState = this.filterState();
          this.filterChange.emit({
            ...currentState,
            dateFrom: dateStr,
          });

          // Update minDate of "To" picker
          if (this.flatpickrTo && dateStr) {
            this.flatpickrTo.set('minDate', dateStr);
          }
        },
      });
      this.flatpickrInitialized = true;
    }

    // "Bis" Date Picker
    if (this.dateToInput?.nativeElement) {
      this.flatpickrTo = flatpickr(this.dateToInput.nativeElement, {
        ...commonConfig,
        onChange: (selectedDates) => {
          const dateStr = selectedDates[0]
            ? this.formatDateISO(selectedDates[0])
            : null;

          const currentState = this.filterState();
          this.filterChange.emit({
            ...currentState,
            dateTo: dateStr,
          });
        },
      });
    }

    // Set initial values from filter state
    this.updateFlatpickrDates();
  }

  /**
   * Update Flatpickr dates from filter state
   */
  private updateFlatpickrDates(): void {
    const state = this.filterState();

    if (this.flatpickrFrom && state.dateFrom) {
      this.flatpickrFrom.setDate(state.dateFrom, false);
    }

    if (this.flatpickrTo && state.dateTo) {
      this.flatpickrTo.setDate(state.dateTo, false);
    }
  }

  /**
   * Destroy Flatpickr instances
   */
  private destroyFlatpickr(): void {
    this.flatpickrFrom?.destroy();
    this.flatpickrTo?.destroy();
    this.flatpickrFrom = null;
    this.flatpickrTo = null;
    this.flatpickrInitialized = false;
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Format date short (e.g. "15.12.")
   */
  private formatDateShort(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return isoDate;
    }
  }

  /**
   * Format Date to ISO string (YYYY-MM-DD)
   */
  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
