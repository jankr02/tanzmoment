import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LEGAL_NAV_ITEMS, LegalPageKey } from './legal-shell.types';

@Component({
  selector: 'tm-legal-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './legal-shell.component.html',
  styleUrl: './legal-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalShellComponent {
  readonly currentPage = input.required<LegalPageKey>();
  readonly title = input.required<string>();
  readonly intro = input<string | undefined>(undefined);
  readonly lastUpdated = input<string | undefined>(undefined);

  protected readonly navItems = LEGAL_NAV_ITEMS;
}
