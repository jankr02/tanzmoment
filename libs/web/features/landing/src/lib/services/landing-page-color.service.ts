import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LandingPageColorService {
  private readonly COLOR = 'var(--color-neutral-xl)';
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  setLandingPageColor(): void {
    if (!this.isBrowser) return;
    this.document.documentElement.style.setProperty('--last-section-bg', this.COLOR);
  }

  resetToDefault(): void {
    if (!this.isBrowser) return;
    this.document.documentElement.style.removeProperty('--last-section-bg');
  }
}
