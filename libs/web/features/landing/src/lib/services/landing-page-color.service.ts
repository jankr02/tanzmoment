import { Injectable, OnDestroy, OnInit } from '@angular/core';

/**
 * Service to set the last section background color CSS variable
 * for the Footer Wave divider component.
 *
 * This is needed because the footer is rendered globally in app.html,
 * outside the page component hierarchy. CSS variables only inherit
 * down the DOM tree, not across sibling elements.
 *
 * Solution: Set the CSS variable on document.documentElement (html tag)
 * so it's available globally for the footer to inherit.
 */
@Injectable({
  providedIn: 'root',
})
export class LandingPageColorService {
  private readonly COLOR = 'var(--color-neutral-xl)';

  setLandingPageColor(): void {
    document.documentElement.style.setProperty('--last-section-bg', this.COLOR);
  }

  resetToDefault(): void {
    document.documentElement.style.removeProperty('--last-section-bg');
  }
}
