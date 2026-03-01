import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '@tanzmoment/shared/ui';
import { IconName } from '@tanzmoment/shared/ui';

interface NavItem {
  label: string;
  icon: IconName;
  route: string;
}

@Component({
  selector: 'tm-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  readonly collapsed = signal(false);
  readonly sidebarWidth = computed(() => (this.collapsed() ? '64px' : '260px'));

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin' },
    { label: 'Kurse', icon: 'book-open', route: '/admin/courses' },
    { label: 'Buchungen', icon: 'clipboard-list', route: '/admin/buchungen' },
    { label: 'Kalender', icon: 'calendar', route: '/admin/kalender' },
    { label: 'Teilnehmer', icon: 'users', route: '/admin/teilnehmer' },
    { label: 'Finanzen', icon: 'wallet', route: '/admin/finanzen' },
    { label: 'Einstellungen', icon: 'settings', route: '/admin/settings' },
  ];

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }
}
