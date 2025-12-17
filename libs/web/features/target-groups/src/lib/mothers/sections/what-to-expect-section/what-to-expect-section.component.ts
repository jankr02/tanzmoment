import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatToExpectData } from './what-to-expect-section.types';

@Component({
  selector: 'tm-what-to-expect-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './what-to-expect-section.component.html',
  styleUrl: './what-to-expect-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatToExpectSectionComponent {
  @Input({ required: true }) data!: WhatToExpectData;
}
