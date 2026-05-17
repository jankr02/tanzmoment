import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '@tanzmoment/shared/services';

import { LegalShellComponent } from '../../components/legal-shell/legal-shell.component';

@Component({
  selector: 'tm-terms-page',
  standalone: true,
  imports: [LegalShellComponent, RouterLink],
  templateUrl: './terms-page.component.html',
  styleUrl: './terms-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'AGB — Tanzmoment',
      description:
        'Allgemeine Geschäftsbedingungen für Kursbuchungen bei Tanzmoment in Mössingen.',
      url: '/agb',
    });
  }
}
