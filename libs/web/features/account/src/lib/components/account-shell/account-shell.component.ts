import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '@tanzmoment/shared/ui';
import { AuthStateService } from '@tanzmoment/shared/services';

interface AccountTab {
  label: string;
  route: string;
}

@Component({
  selector: 'lib-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  templateUrl: './account-shell.component.html',
  styleUrls: ['./account-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountShellComponent {
  private readonly authState = inject(AuthStateService);

  readonly displayName = this.authState.displayName;
  readonly initials = this.authState.initials;

  readonly tabs: AccountTab[] = [
    { label: 'Übersicht', route: 'uebersicht' },
    { label: 'Meine Buchungen', route: 'buchungen' },
    { label: 'Sicherheit', route: 'sicherheit' },
    { label: 'Kommunikation', route: 'kommunikation' },
  ];
}
