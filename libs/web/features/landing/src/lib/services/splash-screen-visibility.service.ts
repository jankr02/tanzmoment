import { Injectable, signal } from '@angular/core';

/**
 * Global service to manage splash screen visibility state
 * Allows the App component to conditionally show/hide header and footer
 */
@Injectable({
  providedIn: 'root',
})
export class SplashScreenVisibilityService {
  /** Signal indicating if splash screen is currently visible */
  private readonly _showSplash = signal(true);

  /** Read-only signal for splash screen visibility */
  readonly showSplash = this._showSplash.asReadonly();

  /**
   * Set splash screen visibility
   * @param visible true to show splash screen, false to hide it
   */
  setSplashVisible(visible: boolean): void {
    this._showSplash.set(visible);
  }
}
