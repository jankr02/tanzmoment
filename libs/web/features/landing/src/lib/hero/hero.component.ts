import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface HeroNavItem {
  label: string;
  route: string;
}

/**
 * Landing Hero Section
 *
 * Editorial hero with an integrated top bar: the logo and primary navigation
 * live inside the hero's left column, directly above the headline — the global
 * site header is hidden on the landing route so the hero owns the whole viewport.
 *
 * - Left column: logo, navigation, headline, supporting copy, primary CTA
 * - Right column: large organic flat-vector illustration that bleeds to the edge
 *
 * The warm illustration establishes the visual language that continues into the
 * feature-navigation section below, connected via the wave divider.
 */
@Component({
  selector: 'tm-hero',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  readonly navItems: HeroNavItem[] = [
    { label: 'Kurse', route: '/courses' },
    { label: 'Über uns', route: '/about' },
    { label: 'News', route: '/news' },
    { label: 'Kontakt', route: '/kontakt' },
  ];
}
