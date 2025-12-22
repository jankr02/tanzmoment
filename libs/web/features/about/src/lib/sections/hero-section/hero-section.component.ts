import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaveDividerComponent } from '@tanzmoment/shared/ui';
import { AboutHeroData } from './hero-section.types';

@Component({
  selector: 'tm-hero-section',
  standalone: true,
  imports: [CommonModule, WaveDividerComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  @Input({ required: true }) data!: AboutHeroData;
}
