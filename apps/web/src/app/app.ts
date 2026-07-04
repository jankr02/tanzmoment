import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import {
  HeaderComponent,
  FooterComponent,
  UserMenuData,
} from '@tanzmoment/shared/ui';
import {
  AuthApiService,
  AuthStateService,
  SplashScreenVisibilityService,
} from '@tanzmoment/shared/services';
import { filter, finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  title = 'Tanzmoment';
  private readonly authState = inject(AuthStateService);
  private readonly authApi = inject(AuthApiService);
  protected readonly splashScreenVisibility = inject(SplashScreenVisibilityService);
  private readonly router = inject(Router);

  private readonly currentRoute = signal('/');

  protected readonly isAuthenticated = computed(() => this.authState.isAuthenticated());

  protected readonly userMenuData = computed<UserMenuData | undefined>(() => {
    const user = this.authState.user();
    if (!user) return undefined;

    const isAdmin = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';

    const menuItems = [
      {
        label: 'Mein Bereich',
        iconName: 'user' as const,
        route: '/mein-bereich',
      },
      ...(isAdmin
        ? [{ label: 'Admin Panel', iconName: 'layout-dashboard' as const, route: '/admin' }]
        : []),
      {
        label: 'Abmelden',
        iconName: 'log-out' as const,
        divider: true,
        action: () => this.onLogout(),
      },
    ];

    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      menuItems,
    };
  });

  protected readonly shouldShowHeaderFooter = computed(() => {
    const route = this.currentRoute();
    const isLandingPage = route === '/';
    const isAdminPage = route.startsWith('/admin');
    const isSplashVisible = this.splashScreenVisibility.showSplash();

    if (isAdminPage) return false;

    return !isLandingPage || !isSplashVisible;
  });

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.url);
      });
  }

  onLoginClicked(): void {
    this.router.navigate(['/auth/login']);
  }

  onRegisterClicked(): void {
    this.router.navigate(['/auth/register']);
  }

  private onLogout(): void {
    // Revoke the refresh-token family and clear the auth cookies server-side,
    // then reset local state regardless of the request outcome.
    this.authApi
      .logout()
      .pipe(
        finalize(() => {
          this.authState.clearAuth();
          this.router.navigate(['/']);
        }),
      )
      .subscribe({ error: () => undefined });
  }
}
