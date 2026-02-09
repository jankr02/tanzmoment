import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { CtaSectionData, CtaButton } from './cta-section.types';

@Component({
  selector: 'tm-accessible-cta-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaSectionComponent {
  @Input({ required: true }) data!: CtaSectionData;

  constructor(private router: Router) {}

  onButtonClick(button: CtaButton): void {
    if (button.externalLink) {
      window.open(button.externalLink, '_blank');
    } else if (button.route) {
      this.router.navigate([button.route]);
    }
  }
}
