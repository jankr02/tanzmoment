// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================
// Horizontal filter bar for the Course Overview Page
// Features: Dropdowns, Active Filter Tags, Clear All, Flatpickr Date Range
// Mobile: Shows only trigger button for modal
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
  HostListener,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { German } from 'flatpickr/dist/l10n/de';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import {
  CourseFilterState,
  EMPTY_FILTER_STATE,
  DANCE_STYLE_OPTIONS,
  LOCATION_OPTIONS,
  DanceStyleOption,
  LocationOption,
  FilterType,
  hasActiveFilters,
  countActiveFilters,
  filterStateToTags,
} from './filter-bar.types';
import { DanceStyleId } from '../dance-style-card/dance-style-card.types';

type LocationId = 'moessingen' | 'bodelshausen';

@Component({
  selector: 'ui-filter-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent implements AfterViewInit, OnDestroy {
  // ──────────────────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ──────────────────────────────────────────────────────────────────────────

  private readonly platformId = inject(PLATFORM_ID);

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW CHILDREN
  // ──────────────────────────────────────────────────────────────────────────

  @ViewChild('dateFromInput') dateFromInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dateToInput') dateToInput!: ElementRef<HTMLInputElement>;

  // ──────────────────────────────────────────────────────────────────────────
  // FLATPICKR INSTANCES
  // ──────────────────────────────────────────────────────────────────────────

  private flatpickrFrom: FlatpickrInstance | null = null;
  private flatpickrTo: FlatpickrInstance | null = null;

  // ──────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ──────────────────────────────────────────────────────────────────────────

  /** Initial filter state (e.g., from URL query params) */
  @Input()
  set initialFilter(value: Partial<CourseFilterState>) {
    if (value) {
      this.filterState.set({ ...EMPTY_FILTER_STATE, ...value });
      // Update Flatpickr instances if they exist
      this.updateFlatpickrDates();
    }
  }

  /** Disables the filter bar */
  @Input() disabled = false;

  /** Shows loading state */
  @Input() loading = false;

  // ──────────────────────────────────────────────────────────────────────────
  // OUTPUTS
  // ──────────────────────────────────────────────────────────────────────────

  /** Emits when filters change */
  @Output() filterChange = new EventEmitter<CourseFilterState>();

  /** Emittiert wenn Mobile-Filter-Button geklickt wird */
  @Output() openMobileFilter = new EventEmitter<void>();

  // ──────────────────────────────────────────────────────────────────────────
  // SIGNALS & STATE
  // ──────────────────────────────────────────────────────────────────────────

  /** Aktueller Filter-State */
  readonly filterState = signal<CourseFilterState>(EMPTY_FILTER_STATE);

  /** Dropdown States */
  readonly danceStyleDropdownOpen = signal(false);
  readonly locationDropdownOpen = signal(false);
  readonly dateRangeDropdownOpen = signal(false);

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────────────

  /** Aktive Filter als Tags */
  readonly activeTags = computed(() => filterStateToTags(this.filterState()));

  /** Hat aktive Filter */
  readonly hasFilters = computed(() => hasActiveFilters(this.filterState()));

  /** Anzahl aktiver Filter */
  readonly filterCount = computed(() => countActiveFilters(this.filterState()));

  /** Ausgewählter Dance Style Label */
  readonly selectedDanceStyleLabel = computed(() => {
    const id = this.filterState().danceStyle;
    if (!id) return 'Alle Tanzstile';
    return (
      DANCE_STYLE_OPTIONS.find((o) => o.id === id)?.label ?? 'Alle Tanzstile'
    );
  });

  /** Ausgewählte Location Label */
  readonly selectedLocationLabel = computed(() => {
    const id = this.filterState().location;
    if (!id) return 'Alle Standorte';
    return LOCATION_OPTIONS.find((o) => o.id === id)?.label ?? 'Alle Standorte';
  });

  /** Ausgewählte Zeitspanne Label */
  readonly selectedDateRangeLabel = computed(() => {
    const { dateFrom, dateTo } = this.filterState();
    if (!dateFrom && !dateTo) return 'Zeitspanne';
    if (dateFrom && dateTo) {
      return `${this.formatDateShort(dateFrom)} - ${this.formatDateShort(dateTo)}`;
    }
    if (dateFrom) return `Ab ${this.formatDateShort(dateFrom)}`;
    if (dateTo) return `Bis ${this.formatDateShort(dateTo)}`;
    return 'Zeitspanne';
  });

  /** Minimum date (today) */
  readonly minDate = computed(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // ──────────────────────────────────────────────────────────────────────────
  // OPTIONS (für Template)
  // ──────────────────────────────────────────────────────────────────────────

  readonly danceStyleOptions: DanceStyleOption[] = DANCE_STYLE_OPTIONS;
  readonly locationOptions: LocationOption[] = LOCATION_OPTIONS;

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ──────────────────────────────────────────────────────────────────────────

  /** Emittiert Filteränderung nur bei User-Interaktion */
  private emitFilterChange(): void {
    this.filterChange.emit(this.filterState());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DROPDOWN HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  toggleDanceStyleDropdown(): void {
    this.locationDropdownOpen.set(false);
    this.dateRangeDropdownOpen.set(false);
    this.danceStyleDropdownOpen.update((v) => !v);
  }

  toggleLocationDropdown(): void {
    this.danceStyleDropdownOpen.set(false);
    this.dateRangeDropdownOpen.set(false);
    this.locationDropdownOpen.update((v) => !v);
  }

  toggleDateRangeDropdown(): void {
    this.danceStyleDropdownOpen.set(false);
    this.locationDropdownOpen.set(false);
    const wasOpen = this.dateRangeDropdownOpen();
    this.dateRangeDropdownOpen.update((v) => !v);

    // Initialize Flatpickr when dropdown opens
    if (!wasOpen && isPlatformBrowser(this.platformId)) {
      // Wait for DOM to update
      setTimeout(() => this.initFlatpickr(), 0);
    }
  }

  closeAllDropdowns(): void {
    this.danceStyleDropdownOpen.set(false);
    this.locationDropdownOpen.set(false);
    this.dateRangeDropdownOpen.set(false);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FILTER HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  selectDanceStyle(id: DanceStyleId | null): void {
    this.filterState.update((state) => ({ ...state, danceStyle: id }));
    this.danceStyleDropdownOpen.set(false);
    this.emitFilterChange();
  }

  selectLocation(id: LocationId | null): void {
    this.filterState.update((state) => ({ ...state, location: id }));
    this.locationDropdownOpen.set(false);
    this.emitFilterChange();
  }

  /**
   * Setzt das Von-Datum
   */
  setDateFrom(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || null;
    this.filterState.update((state) => ({ ...state, dateFrom: value }));
    this.emitFilterChange();
  }

  /**
   * Setzt das Bis-Datum
   */
  setDateTo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || null;
    this.filterState.update((state) => ({ ...state, dateTo: value }));
    this.emitFilterChange();
  }

  /**
   * Setzt beide Datumsfelder zurück
   */
  clearDateRange(): void {
    this.filterState.update((state) => ({ ...state, dateFrom: null, dateTo: null }));

    // Clear Flatpickr instances
    this.flatpickrFrom?.clear();
    this.flatpickrTo?.clear();

    this.dateRangeDropdownOpen.set(false);
    this.emitFilterChange();
  }

  /**
   * Entfernt einen einzelnen Filter
   */
  removeFilter(type: FilterType): void {
    this.filterState.update((state) => ({ ...state, [type]: null }));
    this.emitFilterChange();
  }

  /**
   * Setzt alle Filter zurück
   */
  clearAllFilters(): void {
    this.filterState.set(EMPTY_FILTER_STATE);
    this.emitFilterChange();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MOBILE
  // ──────────────────────────────────────────────────────────────────────────

  onMobileFilterClick(): void {
    this.openMobileFilter.emit();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Prüft ob Option ausgewählt ist
   */
  isDanceStyleSelected(id: DanceStyleId): boolean {
    return this.filterState().danceStyle === id;
  }

  isLocationSelected(id: LocationId): boolean {
    return this.filterState().location === id;
  }

  /**
   * Schließt Dropdowns bei Klick außerhalb
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-bar__dropdown')) {
      this.closeAllDropdowns();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ──────────────────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    // Flatpickr is initialized when dropdown opens (see toggleDateRangeDropdown)
  }

  ngOnDestroy(): void {
    this.destroyFlatpickr();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FLATPICKR INITIALIZATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Initialisiert Flatpickr für beide Date-Inputs
   */
  private initFlatpickr(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const commonConfig = {
      locale: German,
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd.m.Y',
      disableMobile: true, // Always use custom picker, even on mobile
      minDate: 'today',
      allowInput: false,
      clickOpens: true,
      monthSelectorType: 'dropdown' as const, // Show month as dropdown
      animate: true,
      static: false, // Position relative to viewport
      appendTo: document.body, // Append to body for proper positioning
    };

    // "Von" Date Picker
    if (this.dateFromInput?.nativeElement) {
      this.flatpickrFrom = flatpickr(this.dateFromInput.nativeElement, {
        ...commonConfig,
        onChange: (selectedDates) => {
          const dateStr = selectedDates[0]
            ? this.formatDateISO(selectedDates[0])
            : null;
          this.filterState.update((state) => ({ ...state, dateFrom: dateStr }));

          // Update minDate of "To" picker
          if (this.flatpickrTo && dateStr) {
            this.flatpickrTo.set('minDate', dateStr);
          }

          this.emitFilterChange();
        },
      });
    }

    // "Bis" Date Picker
    if (this.dateToInput?.nativeElement) {
      this.flatpickrTo = flatpickr(this.dateToInput.nativeElement, {
        ...commonConfig,
        onChange: (selectedDates) => {
          const dateStr = selectedDates[0]
            ? this.formatDateISO(selectedDates[0])
            : null;
          this.filterState.update((state) => ({ ...state, dateTo: dateStr }));
          this.emitFilterChange();
        },
      });
    }
  }

  /**
   * Zerstört Flatpickr-Instanzen
   */
  private destroyFlatpickr(): void {
    this.flatpickrFrom?.destroy();
    this.flatpickrTo?.destroy();
    this.flatpickrFrom = null;
    this.flatpickrTo = null;
  }

  /**
   * Aktualisiert Flatpickr-Daten (z.B. nach initialFilter setzen)
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

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Formatiert ISO-Datum kurz (z.B. "15.12.")
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
   * Formatiert Date zu ISO-String (YYYY-MM-DD)
   */
  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
