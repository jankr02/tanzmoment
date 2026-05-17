import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { SeoService } from '@tanzmoment/shared/services';

import { LegalShellComponent } from '../../components/legal-shell/legal-shell.component';

@Component({
  selector: 'tm-imprint-page',
  standalone: true,
  imports: [LegalShellComponent],
  templateUrl: './imprint-page.component.html',
  styleUrl: './imprint-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImprintPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Impressum — Tanzmoment',
      description:
        'Impressum und Anbieterkennzeichnung gemäß §5 TMG für das Tanzstudio Tanzmoment in Mössingen.',
      url: '/impressum',
    });
  }
}
