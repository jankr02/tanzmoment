import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ImagePreloadService } from '@tanzmoment/shared/services';
import { SkeletonHeroComponent } from '@tanzmoment/shared/ui';

/**
 * Interface for Hero Slide Data
 */
export interface HeroSlide {
  id: number;
  imageUrl: string;
  alt: string;
  quote?: string; // Optional quote for each image
}

/**
 * Enhanced Hero Gallery Component with Intelligent Preloading
 *
 * Features:
 * - Fullscreen viewport hero with smooth image transitions
 * - Wave-shaped border at the bottom
 * - Decorative SVG illustrations (Wind, Silhouette, Leafs)
 * - Auto-play with manual navigation
 * - Optional quote display with elegant fade + slide-up animation
 * - Ken Burns effect on images for cinematic feel
 *
 * NEW - Phase 3.3 Enhancements:
 * - ImagePreloadService integration for smart loading
 * - Skeleton screen during initial load
 * - Lookahead preload for next 2 slides
 * - Cache detection for instant display
 * - Smooth skeleton → content transitions
 * - First image EAGER load (via splash screen preload)
 *
 * @example
 * ```html
 * <tm-hero-gallery />
 * ```
 */
@Component({
  selector: 'tm-hero-gallery',
  standalone: true,
  imports: [CommonModule, SkeletonHeroComponent],
  templateUrl: './hero-gallery.component.html',
  styleUrl: './hero-gallery.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class HeroGalleryComponent implements OnInit, OnDestroy {
  /** Emitted when hero gallery is ready (first image loaded) */
  @Output() ready = new EventEmitter<void>();

  /** Emitted when hero gallery encounters an error */
  @Output() loadError = new EventEmitter<ErrorEvent>();

  // ==========================================================================
  // Dependencies
  // ==========================================================================

  private readonly imagePreloadService = inject(ImagePreloadService);
  private readonly ngZone = inject(NgZone);

  // ==========================================================================
  // State Management - Slide Navigation
  // ==========================================================================

  currentSlideIndex = signal<number>(0);
  currentSlide = computed(() => this.slides[this.currentSlideIndex()]);

  private autoPlayInterval?: ReturnType<typeof setInterval>;
  private readonly AUTO_PLAY_INTERVAL = 5000; // 5 seconds

  // ==========================================================================
  // State Management - Loading & Preloading
  // ==========================================================================

  /** Whether initial content is ready (first image loaded) */
  isReady = signal<boolean>(false);

  /** Whether first image is currently loading */
  isFirstImageLoading = signal<boolean>(true);

  /** Set of image URLs that have been successfully loaded */
  private loadedImages = new Set<string>();

  // ==========================================================================
  // Data
  // ==========================================================================

  slides: HeroSlide[] = [
    {
      id: 1,
      imageUrl: 'assets/images/hero/dance-1.jpg',
      alt: 'Tänzerin in Bewegung',
      quote:
        'Manchmal sagt mein Körper, was mein Herz noch nicht in Worte fassen kann.',
    },
    {
      id: 2,
      imageUrl: 'assets/images/hero/dance-2.jpg',
      alt: 'Tanzmoment im Studio',
    },
    {
      id: 3,
      imageUrl: 'assets/images/hero/dance-3.jpg',
      alt: 'Ausdrucksvoller Tanz',
      quote: 'Im Tanz finde ich meine Freiheit.',
    },
    {
      id: 4,
      imageUrl: 'assets/images/hero/dance-4.jpg',
      alt: 'Tanz und Emotion',
    },
    {
      id: 5,
      imageUrl: 'assets/images/hero/dance-5.jpg',
      alt: 'Bewegung als Ausdruck',
      quote: 'Jeder Schritt erzählt eine Geschichte.',
    },
  ];

  // ==========================================================================
  // Lifecycle Hooks
  // ==========================================================================

  constructor() {
    // All images are preloaded upfront in initializeGallery()
  }

  ngOnInit(): void {
    this.initializeGallery();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize gallery with smart loading strategy.
   * Now emits ready/error events for parent coordination.
   */
  private initializeGallery(): void {
    const firstImageUrl = this.slides[0].imageUrl;

    // Check if first image was already preloaded
    if (this.imagePreloadService.isImageCached(firstImageUrl)) {
      console.log('[HeroGallery] First image already cached, instant display');

      this.ngZone.run(() => {
        this.markImageAsLoaded(firstImageUrl);
        this.isFirstImageLoading.set(false);
        this.isReady.set(true);

        this.ready.emit();

        this.startAutoPlay();
        this.preloadAllSlides();
      });
    } else {
      console.log('[HeroGallery] First image not cached, loading now');

      // Load first image
      this.imagePreloadService.preloadImage(firstImageUrl).subscribe({
        next: (result) => {
          if (result.loaded) {
            // Run inside Angular zone to trigger change detection
            this.ngZone.run(() => {
              console.log(
                `[HeroGallery] First image loaded in ${result.loadTime}ms`
              );
              this.markImageAsLoaded(firstImageUrl);
              this.isFirstImageLoading.set(false);
              this.isReady.set(true);

              // ✅ EMIT READY EVENT
              this.ready.emit();

              this.startAutoPlay();
              this.preloadAllSlides();
            });
          }
        },
        error: (err) => {
          // Run inside Angular zone to trigger change detection
          this.ngZone.run(() => {
            console.error('[HeroGallery] Failed to load first image:', err);

            this.loadError.emit(
              new ErrorEvent('error', {
                message: 'Failed to load first image',
                error: err,
              })
            );

            // Show content anyway (let browser handle broken image)
            this.isFirstImageLoading.set(false);
            this.isReady.set(true);
            this.startAutoPlay();
          });
        },
      });
    }
  }

  // ==========================================================================
  // Image Preloading
  // ==========================================================================

  /**
   * Preload ALL slides immediately for smooth transitions.
   * Uses ImagePreloadService to cache all images upfront.
   */
  private preloadAllSlides(): void {
    // Skip first image (already loaded)
    const remainingImages = this.slides.slice(1).map((slide) => slide.imageUrl);

    if (remainingImages.length === 0) return;

    // Preload all remaining images immediately
    remainingImages.forEach((url) => {
      if (!this.imagePreloadService.isImageCached(url)) {
        this.imagePreloadService.preloadImage(url).subscribe({
          next: (result) => {
            if (result.loaded) {
              this.ngZone.run(() => {
                this.markImageAsLoaded(result.url);
                console.log(
                  `[HeroGallery] Preloaded: ${result.url} (${result.loadTime}ms)`
                );
              });
            }
          },
          error: (error) => {
            console.warn(`[HeroGallery] Failed to preload ${url}:`, error);
          },
        });
      } else {
        this.markImageAsLoaded(url);
      }
    });
  }

  /**
   * Mark an image URL as successfully loaded.
   */
  private markImageAsLoaded(url: string): void {
    this.loadedImages.add(url);
  }

  /**
   * Check if a specific image has been loaded.
   */
  isImageLoaded(url: string): boolean {
    return (
      this.loadedImages.has(url) || this.imagePreloadService.isImageCached(url)
    );
  }

  // ==========================================================================
  // Navigation Methods
  // ==========================================================================

  nextSlide(): void {
    this.resetAutoPlay();
    const nextIndex = (this.currentSlideIndex() + 1) % this.slides.length;
    this.currentSlideIndex.set(nextIndex);
  }

  previousSlide(): void {
    this.resetAutoPlay();
    const prevIndex =
      this.currentSlideIndex() === 0
        ? this.slides.length - 1
        : this.currentSlideIndex() - 1;
    this.currentSlideIndex.set(prevIndex);
  }

  goToSlide(index: number): void {
    this.resetAutoPlay();
    this.currentSlideIndex.set(index);
  }

  // ==========================================================================
  // Auto-Play Logic
  // ==========================================================================

  private startAutoPlay(): void {
    this.stopAutoPlay();

    this.autoPlayInterval = setInterval(() => {
      this.ngZone.run(() => {
        const nextIndex = (this.currentSlideIndex() + 1) % this.slides.length;
        this.currentSlideIndex.set(nextIndex);
      });
    }, this.AUTO_PLAY_INTERVAL);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = undefined;
    }
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
