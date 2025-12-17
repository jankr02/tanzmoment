// ============================================================================
// FILTER MODAL COMPONENT
// ============================================================================
// Fullscreen Modal für Mobile Filter
// Features: Slide-in Animation, Body Scroll Lock, Keyboard Navigation
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  Renderer2,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  CourseFilterState,
  EMPTY_FILTER_STATE,
  DANCE_STYLE_OPTIONS,
  LOCATION_OPTIONS,
  DanceStyleOption,
  LocationOption,
  LocationId,
  DanceStyleId,
  hasActiveFilters,
  countActiveFilters,
} from '../filter-bar/filter-bar.types';

@Component({
  selector: 'ui-filter-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterModalComponent implements OnInit, OnDestroy {
  // ──────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ──────────────────────────────────────────────────────────────────────────

  /** Ob Modal offen ist */
  @Input()
  set isOpen(value: boolean) {
    this._isOpen.set(value);
    if (value) {
      this.onOpen();
    } else {
      this.onClose();
    }
  }
  get isOpen(): boolean {
    return this._isOpen();
  }

  /** Aktueller Filter-State von Parent */
  @Input()
  set currentFilter(value: CourseFilterState) {
    if (value) {
      this.localFilterState.set({ ...value });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // OUTPUTS
  // ──────────────────────────────────────────────────────────────────────────

  /** Emittiert wenn Modal geschlossen werden soll */
  @Output() closeModal = new EventEmitter<void>();

  /** Emittiert Filter wenn "Anwenden" geklickt wird */
  @Output() applyFilter = new EventEmitter<CourseFilterState>();

  // ──────────────────────────────────────────────────────────────────────────
  // SIGNALS & STATE
  // ──────────────────────────────────────────────────────────────────────────

  /** Internal open state */
  private readonly _isOpen = signal(false);

  /** Lokaler Filter-State (wird erst bei Apply committed) */
  readonly localFilterState = signal<CourseFilterState>(EMPTY_FILTER_STATE);

  /** Animation state für smooth close */
  readonly isClosing = signal(false);

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────────────

  /** Hat lokale Filter */
  readonly hasLocalFilters = computed(() =>
    hasActiveFilters(this.localFilterState())
  );

  /** Anzahl lokaler Filter */
  readonly localFilterCount = computed(() =>
    countActiveFilters(this.localFilterState())
  );

  // ──────────────────────────────────────────────────────────────────────────
  // OPTIONS (für Template)
  // ──────────────────────────────────────────────────────────────────────────

  readonly danceStyleOptions: DanceStyleOption[] = DANCE_STYLE_OPTIONS;
  readonly locationOptions: LocationOption[] = LOCATION_OPTIONS;

  // ──────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ──────────────────────────────────────────────────────────────────────────

  private readonly platformId = inject(PLATFORM_ID);

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  /** Nur im Browser ausführen */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Focus trap setup könnte hier erfolgen
  }

  ngOnDestroy(): void {
    this.enableBodyScroll();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // KEYBOARD HANDLING
  // ──────────────────────────────────────────────────────────────────────────

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this._isOpen()) {
      this.onCloseClick();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // OPEN / CLOSE HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  private onOpen(): void {
    this.disableBodyScroll();
    this.isClosing.set(false);

    // Focus first interactive element after animation
    setTimeout(() => {
      const firstFocusable = this.elementRef.nativeElement.querySelector(
        'button, [tabindex="0"]'
      );
      firstFocusable?.focus();
    }, 100);
  }

  private onClose(): void {
    this.enableBodyScroll();
  }

  onCloseClick(): void {
    // Trigger closing animation
    this.isClosing.set(true);

    // Wait for animation then emit close
    setTimeout(() => {
      this.closeModal.emit();
    }, 250); // Match animation duration
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      (event.target as HTMLElement).classList.contains('filter-modal__backdrop')
    ) {
      this.onCloseClick();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BODY SCROLL LOCK
  // ──────────────────────────────────────────────────────────────────────────

  private disableBodyScroll(): void {
    if (!this.isBrowser) return;
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  private enableBodyScroll(): void {
    if (!this.isBrowser) return;
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'overflow');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FILTER HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  selectDanceStyle(id: DanceStyleId | null): void {
    this.localFilterState.update((state) => ({
      ...state,
      danceStyle: state.danceStyle === id ? null : id, // Toggle
    }));
  }

  selectLocation(id: LocationId | null): void {
    this.localFilterState.update((state) => ({
      ...state,
      location: state.location === id ? null : id, // Toggle
    }));
  }

  /**
   * Setzt alle lokalen Filter zurück
   */
  resetFilters(): void {
    this.localFilterState.set(EMPTY_FILTER_STATE);
  }

  /**
   * Wendet Filter an und schließt Modal
   */
  onApplyClick(): void {
    this.applyFilter.emit(this.localFilterState());
    this.onCloseClick();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  isDanceStyleSelected(id: DanceStyleId): boolean {
    return this.localFilterState().danceStyle === id;
  }

  isLocationSelected(id: LocationId): boolean {
    return this.localFilterState().location === id;
  }
}
