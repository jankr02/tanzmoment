import { Injectable, signal } from '@angular/core';

const SPLASH_SHOWN_KEY = 'tm_splash_shown';

/**
 * Global service to manage splash screen visibility state
 * Allows the App component to conditionally show/hide header and footer
 */
@Injectable({
  providedIn: 'root',
})
export class SplashScreenVisibilityService {
  private readonly _showSplash = signal(!localStorage.getItem(SPLASH_SHOWN_KEY));

  readonly showSplash = this._showSplash.asReadonly();

  setSplashVisible(visible: boolean): void {
    this._showSplash.set(visible);
    if (!visible) {
      localStorage.setItem(SPLASH_SHOWN_KEY, '1');
    }
  }
}
