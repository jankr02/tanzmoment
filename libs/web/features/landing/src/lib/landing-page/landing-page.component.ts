import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent, FooterComponent } from '@tanzmoment/shared/ui';
import { HeroGalleryComponent } from '../hero-gallery/hero-gallery.component';
import { FeatureNavigationComponent } from '../feature-navigation/feature-navigation.component';

@Component({
  selector: 'tm-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HeroGalleryComponent,
    FeatureNavigationComponent, // ✅ Feature Navigation Component imported
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  /**
   * Landing Page Container Component
   * 
   * This component serves as the main container for the landing page.
   * It orchestrates the layout and composition of:
   * - Header (from shared UI)
   * - Hero Gallery Section (image slider with quote and illustrations)
   * - Feature Navigation Section (three linked feature cards)
   * - Footer (from shared UI)
   */
}