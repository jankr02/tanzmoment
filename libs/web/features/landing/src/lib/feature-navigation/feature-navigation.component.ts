import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Interface for Feature Card Data
 */
export interface FeatureCard {
  id: number;
  title: string;
  desktopTitle: string;
  illustration: string;
  route: string;
  alt: string;
}

@Component({
  selector: 'tm-feature-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-navigation.component.html',
  styleUrl: './feature-navigation.component.scss',
})
export class FeatureNavigationComponent {
  /**
   * Feature Navigation Component
   *
   * Features:
   * - Three clickable feature cards with illustrations
   * - Smooth hover animations with scale and shadow
   * - Organic, curved card shapes that match the brand
   * - Responsive grid layout
   * - Navigation to different pages
   */

  private readonly router: Router = inject(Router);

  // ========================================
  // Feature Cards Data
  // ========================================

  features: FeatureCard[] = [
    {
      id: 1,
      title: 'Studio',
      desktopTitle: 'Lerne unser Studio kennen',
      illustration: '/assets/illustrations/About Me.svg',
      route: '/about',
      alt: 'Über unser Studio - Lerne uns kennen',
    },
    {
      id: 2,
      title: 'Kurse',
      desktopTitle: 'Entdecke unsere Tanzkurse',
      illustration: '/assets/illustrations/Bird.svg',
      route: '/courses',
      alt: 'Entdecke verschiedene Tanzkurse',
    },
    {
      id: 3,
      title: 'Neuigkeiten',
      desktopTitle: 'Bleib auf dem Laufenden',
      illustration: '/assets/illustrations/flower.svg',
      route: '/news',
      alt: 'Neuigkeiten und Updates',
    },
  ];

  // ========================================
  // Navigation Methods
  // ========================================

  navigateToFeature(route: string): void {
    this.router.navigate([route]);
  }
}
