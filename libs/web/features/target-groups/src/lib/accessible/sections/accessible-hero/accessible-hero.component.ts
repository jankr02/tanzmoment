import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { AccessibleHeroData } from './accessible-hero.types';

@Component({
  selector: 'tm-accessible-hero',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './accessible-hero.component.html',
  styleUrl: './accessible-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibleHeroComponent {
  @Input({ required: true }) data!: AccessibleHeroData;

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
