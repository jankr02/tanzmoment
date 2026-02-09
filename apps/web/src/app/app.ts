import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent, FooterComponent } from '@tanzmoment/shared/ui';
import { AuthStateService, SplashScreenVisibilityService } from '@tanzmoment/web/features/landing';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'Tanzmoment';
  protected readonly authState = inject(AuthStateService);
  protected readonly splashScreenVisibility = inject(SplashScreenVisibilityService);
  private readonly router = inject(Router);

  /**
   * Track current route - updates reactively when navigation occurs
   */
  private readonly currentRoute = signal('/');

  /**
   * Determines if header/footer should be visible
   * - Hidden during splash screen on landing page
   * - Always visible on all other pages
   */
  protected readonly shouldShowHeaderFooter = computed(() => {
    const isLandingPage = this.currentRoute() === '/';
    const isSplashVisible = this.splashScreenVisibility.showSplash();

    // Show header/footer if:
    // - NOT on landing page, OR
    // - On landing page but splash screen is hidden
    return !isLandingPage || !isSplashVisible;
  });

  constructor() {
    // Subscribe to router navigation events to update current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.url);
      });
  }

  onLoginClicked(): void {
    this.authState.login(0);
  }
}