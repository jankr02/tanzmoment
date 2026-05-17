// ============================================================================
// DANCE STYLES JOURNEY — Mobile scroll-snap "visual journey"
// ============================================================================
// Full-viewport scenes, one per dance style, vertically scroll-snapped.
// Used as the mobile (≤ 768px) replacement for the desktop dance styles section.
// ============================================================================

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  DEFAULT_DANCE_STYLES,
  DanceStyleCardData,
  DanceStyleId,
  DanceStyleNavigationMode,
} from '../dance-style-card/dance-style-card.types';
import {
  DANCE_STYLE_JOURNEY_ORDER,
  DANCE_STYLE_JOURNEY_THEMES,
  DANCE_STYLE_SHORT_LABELS,
  DanceStyleJourneyTheme,
} from './dance-styles-journey.types';

interface JourneyScene {
  id: DanceStyleId;
  title: string;
  illustrationUrl: string;
  route?: string;
  theme: DanceStyleJourneyTheme;
  index: number;
  number: string;
  counter: string;
  next?: { id: DanceStyleId; shortLabel: string; bg: string };
}

const SCENE_TAP_THRESHOLD_PX = 10;

@Component({
  selector: 'ui-dance-styles-journey',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dance-styles-journey.component.html',
  styleUrl: './dance-styles-journey.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'region',
    'aria-roledescription': 'Tanzwelt-Galerie',
    'aria-label': 'Unsere Tanzwelten',
  },
})
export class DanceStylesJourneyComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  @Input() set danceStyles(value: DanceStyleCardData[]) {
    this.danceStylesInput.set(value ?? DEFAULT_DANCE_STYLES);
  }

  @Input() navigationMode: DanceStyleNavigationMode = 'emit';

  @Output() readonly styleSelected = new EventEmitter<DanceStyleId>();

  private readonly danceStylesInput = signal<DanceStyleCardData[]>(
    DEFAULT_DANCE_STYLES,
  );
  readonly activeIndex = signal(0);

  readonly scenes = computed<JourneyScene[]>(() => {
    const dataById = new Map(
      this.danceStylesInput().map((s) => [s.id, s] as const),
    );
    const total = DANCE_STYLE_JOURNEY_ORDER.length;

    return DANCE_STYLE_JOURNEY_ORDER.map((id, index) => {
      const data = dataById.get(id);
      const theme = DANCE_STYLE_JOURNEY_THEMES[id];
      const fallback = DEFAULT_DANCE_STYLES.find((s) => s.id === id);
      const nextId = DANCE_STYLE_JOURNEY_ORDER[index + 1];
      const nextTheme = nextId ? DANCE_STYLE_JOURNEY_THEMES[nextId] : undefined;

      return {
        id,
        title: data?.label ?? fallback?.label ?? '',
        illustrationUrl:
          data?.illustrationUrl ?? fallback?.illustrationUrl ?? '',
        route: data?.route ?? fallback?.route,
        theme,
        index,
        number: String(index + 1).padStart(2, '0'),
        counter: `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
        next:
          nextId && nextTheme
            ? {
                id: nextId,
                shortLabel: DANCE_STYLE_SHORT_LABELS[nextId],
                bg: nextTheme.bg,
              }
            : undefined,
      };
    });
  });

  readonly activeScene = computed(
    () => this.scenes()[this.activeIndex()] ?? this.scenes()[0],
  );

  private readonly scrollerRef =
    viewChild.required<ElementRef<HTMLDivElement>>('scroller');

  private rafId: number | null = null;
  private scrollListener?: () => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.scrollerRef().nativeElement;
    this.zone.runOutsideAngular(() => {
      const handler = () => {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => {
          this.rafId = null;
          const h = el.clientHeight;
          if (h <= 0) return;
          const idx = Math.min(
            this.scenes().length - 1,
            Math.max(0, Math.round(el.scrollTop / h)),
          );
          if (idx !== this.activeIndex()) {
            this.zone.run(() => this.setActiveIndex(idx));
          }
        });
      };
      this.scrollListener = handler;
      el.addEventListener('scroll', handler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollListener) {
      const el = this.scrollerRef()?.nativeElement;
      el?.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = undefined;
    }
  }

  goTo(index: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.scrollerRef().nativeElement;
    const h = el.clientHeight;
    el.scrollTo({ top: index * h, behavior: 'smooth' });
  }

  private setActiveIndex(index: number): void {
    if (index === this.activeIndex()) return;
    this.activeIndex.set(index);
  }

  private pointerStart: { x: number; y: number } | null = null;

  onScenePointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.pointerStart = { x: event.clientX, y: event.clientY };
  }

  onScenePointerUp(event: PointerEvent, scene: JourneyScene): void {
    const start = this.pointerStart;
    this.pointerStart = null;
    if (!start) return;

    // Releasing over a nested interactive control (e.g. the "Weiter zu" hint
    // button) lets that control handle the activation — the scene-level tap
    // must not double-fire.
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a')) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) > SCENE_TAP_THRESHOLD_PX) return;

    this.activateScene(scene);
  }

  onScenePointerCancel(): void {
    this.pointerStart = null;
  }

  onSceneKeydown(event: Event, scene: JourneyScene): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.activateScene(scene);
  }

  private activateScene(scene: JourneyScene): void {
    if (this.navigationMode === 'navigate' && scene.route) {
      this.router.navigate([scene.route]);
      return;
    }
    this.styleSelected.emit(scene.id);
  }

  trackById(_index: number, scene: JourneyScene): DanceStyleId {
    return scene.id;
  }
}
