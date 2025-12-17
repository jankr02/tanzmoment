import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { KidsHeroData } from './kids-hero.types';

@Component({
  selector: 'tm-kids-hero',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './kids-hero.component.html',
  styleUrl: './kids-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KidsHeroComponent {
  @Input({ required: true }) data!: KidsHeroData;

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
