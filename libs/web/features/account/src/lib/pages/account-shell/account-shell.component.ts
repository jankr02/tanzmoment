import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStateService } from '@tanzmoment/shared/services';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { AccountStore } from '../../services/account.store';

interface AccountTab {
  readonly path: string;
  readonly label: string;
}

const ACCOUNT_TABS: ReadonlyArray<AccountTab> = [
  { path: 'profil', label: 'Profil' },
  { path: 'passwort', label: 'Passwort' },
  { path: 'benachrichtigungen', label: 'Benachrichtigungen' },
  { path: 'verbundene-konten', label: 'Verbundene Konten' },
  { path: 'loeschen', label: 'Konto löschen' },
];

@Component({
  selector: 'tm-account-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ButtonComponent,
  ],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
})
export class AccountShellComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  protected readonly store = inject(AccountStore);

  protected readonly tabs = ACCOUNT_TABS;

  protected readonly displayName = computed(() => this.authState.displayName());

  ngOnInit(): void {
    this.store.load();
  }

  protected retry(): void {
    this.store.load(true);
  }
}
