import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SPLASH_SHOWN_KEY = 'tm_splash_shown';

@Injectable({
  providedIn: 'root',
})
export class SplashScreenVisibilityService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _showSplash = signal(this.readInitialState());

  readonly showSplash = this._showSplash.asReadonly();

  setSplashVisible(visible: boolean): void {
    this._showSplash.set(visible);
    if (!visible && this.isBrowser) {
      try {
        localStorage.setItem(SPLASH_SHOWN_KEY, '1');
      } catch {
        // ignore storage errors (private mode, quota, ...)
      }
    }
  }

  private readInitialState(): boolean {
    if (!this.isBrowser) return false;
    try {
      return !localStorage.getItem(SPLASH_SHOWN_KEY);
    } catch {
      return false;
    }
  }
}
