import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { SeoService } from '@tanzmoment/shared/services';

import { LegalShellComponent } from '../../components/legal-shell/legal-shell.component';

@Component({
  selector: 'tm-privacy-page',
  standalone: true,
  imports: [LegalShellComponent],
  templateUrl: './privacy-page.component.html',
  styleUrl: './privacy-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Datenschutz — Tanzmoment',
      description:
        'Datenschutzerklärung der Tanzschule Tanzmoment. Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
      url: '/datenschutz',
    });
  }
}
