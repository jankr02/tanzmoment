import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpacesSectionData, SpaceLocation } from './spaces-section.types';

/** Delay before the location data swaps mid cross-fade (ms). */
const CROSS_FADE_SWAP_DELAY = 220;

@Component({
  selector: 'tm-spaces-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spaces-section.component.html',
  styleUrl: './spaces-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacesSectionComponent implements OnInit, OnDestroy {
  @Input({ required: true }) data!: SpacesSectionData;

  /** Location shown first — matched against location id or name. */
  @Input() defaultLocation?: string;

  /** Toggle the decorative flower illustration in the profile panel. */
  @Input() showIllustration = true;

  /** Index of the active location. */
  readonly active = signal(0);

  /** True while the content cross-fades out before swapping. */
  readonly fading = signal(false);

  private fadeTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (this.defaultLocation) {
      const index = this.data.locations.findIndex(
        (location) =>
          location.id === this.defaultLocation ||
          location.name === this.defaultLocation,
      );
      if (index >= 0) {
        this.active.set(index);
      }
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.fadeTimer);
  }

  currentLocation(): SpaceLocation {
    return this.data.locations[this.active()];
  }

  select(index: number): void {
    // Cancel any in-flight cross-fade first, so re-selecting the current
    // location can't leave a stale timer that swaps to the wrong one.
    clearTimeout(this.fadeTimer);

    if (index === this.active()) {
      this.fading.set(false);
      return;
    }

    if (this.prefersReducedMotion()) {
      this.active.set(index);
      return;
    }

    this.fading.set(true);
    this.fadeTimer = setTimeout(() => {
      this.active.set(index);
      this.fading.set(false);
    }, CROSS_FADE_SWAP_DELAY);
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
