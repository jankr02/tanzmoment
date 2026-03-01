import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SettingsTab {
  label: string;
  route: string;
  routerLinkActiveOptions: { exact: boolean };
}

@Component({
  selector: 'tm-settings-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-shell.component.html',
  styleUrls: ['./settings-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsShellComponent {
  readonly tabs: SettingsTab[] = [
    {
      label: 'Studio-Profil',
      route: 'profil',
      routerLinkActiveOptions: { exact: false },
    },
    {
      label: 'Standorte',
      route: 'standorte',
      routerLinkActiveOptions: { exact: false },
    },
    {
      label: 'Konto',
      route: 'konto',
      routerLinkActiveOptions: { exact: false },
    },
  ];
}
