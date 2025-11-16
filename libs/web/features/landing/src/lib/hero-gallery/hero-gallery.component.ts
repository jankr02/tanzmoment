import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interface for Hero Slide Data
 */
export interface HeroSlide {
  id: number;
  imageUrl: string;
  alt: string;
  quote?: string; // Optional quote for each image
}

@Component({
  selector: 'tm-hero-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-gallery.component.html',
  styleUrl: './hero-gallery.component.scss',
})
export class HeroGalleryComponent implements OnInit, OnDestroy {
  /**
   * Hero Gallery Component - Fullscreen Design
   * 
   * Features:
   * - Fullscreen viewport hero with smooth image transitions
   * - Text overlay positioned top-right with fade animations
   * - Wave-shaped border at the bottom
   * - Decorative SVG illustrations (Wind, Silhouette, Leafs)
   * - Auto-play with manual navigation
   * - Optional quote display with elegant fade + slide-up animation
   * - Ken Burns effect on images for cinematic feel
   */

  // ========================================
  // State Management with Signals
  // ========================================

  currentSlideIndex = signal<number>(0);
  currentSlide = computed(() => this.slides[this.currentSlideIndex()]);

  private autoPlayInterval?: ReturnType<typeof setInterval>;
  private readonly AUTO_PLAY_INTERVAL = 5000; // 5 seconds

  // Full text strings
  readonly FULL_TITLE = 'Tanzmoment';
  readonly FULL_TAGLINE = 'Einfach tanzen. Ganz du.';

  // ========================================
  // Mock Data (TODO: Replace with API call)
  // ========================================

  slides: HeroSlide[] = [
    {
      id: 1,
      imageUrl: '/assets/images/hero/dance-1.jpg',
      alt: 'Tänzerin in Bewegung',
      quote: 'Manchmal sagt mein Körper, was mein Herz noch nicht in Worte fassen kann.',
    },
    {
      id: 2,
      imageUrl: '/assets/images/hero/dance-2.jpg',
      alt: 'Tanzmoment im Studio',
    },
    {
      id: 3,
      imageUrl: '/assets/images/hero/dance-3.jpg',
      alt: 'Ausdrucksvoller Tanz',
      quote: 'Im Tanz finde ich meine Freiheit.',
    },
    {
      id: 4,
      imageUrl: '/assets/images/hero/dance-4.jpg',
      alt: 'Tanz und Emotion',
    },
    {
      id: 5,
      imageUrl: '/assets/images/hero/dance-5.jpg',
      alt: 'Bewegung als Ausdruck',
      quote: 'Jeder Schritt erzählt eine Geschichte.',
    },
  ];

  // ========================================
  // Lifecycle Hooks
  // ========================================

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  // ========================================
  // Navigation Methods
  // ========================================

  nextSlide(): void {
    this.resetAutoPlay();
    const nextIndex = (this.currentSlideIndex() + 1) % this.slides.length;
    this.currentSlideIndex.set(nextIndex);
  }

  previousSlide(): void {
    this.resetAutoPlay();
    const prevIndex = this.currentSlideIndex() === 0 
      ? this.slides.length - 1 
      : this.currentSlideIndex() - 1;
    this.currentSlideIndex.set(prevIndex);
  }

  goToSlide(index: number): void {
    this.resetAutoPlay();
    this.currentSlideIndex.set(index);
  }

  // ========================================
  // Auto-Play Logic
  // ========================================

  private startAutoPlay(): void {
    this.stopAutoPlay();
    
    this.autoPlayInterval = setInterval(() => {
      const nextIndex = (this.currentSlideIndex() + 1) % this.slides.length;
      this.currentSlideIndex.set(nextIndex);
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