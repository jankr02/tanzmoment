import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { MothersHeroData } from './mothers-hero.types';

@Component({
  selector: 'tm-mothers-hero',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './mothers-hero.component.html',
  styleUrl: './mothers-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MothersHeroComponent {
  @Input({ required: true }) data!: MothersHeroData;

  constructor(private router: Router) {}

  onCtaClick(): void {
    this.router.navigate([this.data.ctaRoute]);
  }
}
