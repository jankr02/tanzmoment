import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { ExpressiveHeroData } from './expressive-hero.types';

@Component({
  selector: 'tm-expressive-hero',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './expressive-hero.component.html',
  styleUrl: './expressive-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressiveHeroComponent {
  @Input({ required: true }) data!: ExpressiveHeroData;

  constructor(private router: Router) {}

  onCtaClick(): void {
    this.router.navigate([this.data.ctaRoute]);
  }

  onSecondaryCtaClick(): void {
    if (this.data.secondaryCtaRoute) {
      this.router.navigate([this.data.secondaryCtaRoute]);
    }
  }
}
