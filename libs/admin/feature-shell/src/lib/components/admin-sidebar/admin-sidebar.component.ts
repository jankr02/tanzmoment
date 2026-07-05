import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { IconComponent } from '@tanzmoment/shared/ui';
import { IconName } from '@tanzmoment/shared/ui';

interface NavItem {
  label: string;
  icon: IconName;
  route: string;
}

/** Course creator/editor routes where the sidebar stays collapsed. */
const EDITOR_ROUTE_PATTERN = /^\/admin\/courses\/[^/]+/;

@Component({
  selector: 'tm-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Forced collapsed while in the course creator/editor. */
  readonly forcedCollapsed = computed(() =>
    EDITOR_ROUTE_PATTERN.test(this.currentUrl()),
  );

  private readonly manualCollapsed = signal(false);

  readonly collapsed = computed(
    () => this.forcedCollapsed() || this.manualCollapsed(),
  );
  readonly sidebarWidth = computed(() => (this.collapsed() ? '64px' : '260px'));

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin' },
    { label: 'Kurse', icon: 'book-open', route: '/admin/courses' },
    { label: 'Buchungen', icon: 'clipboard-list', route: '/admin/buchungen' },
    { label: 'Kalender', icon: 'calendar', route: '/admin/kalender' },
    { label: 'Teilnehmer', icon: 'users', route: '/admin/teilnehmer' },
    { label: 'Finanzen', icon: 'wallet', route: '/admin/finanzen' },
    { label: 'News', icon: 'newspaper', route: '/admin/news' },
    { label: 'Einstellungen', icon: 'settings', route: '/admin/einstellungen' },
  ];

  toggleCollapsed(): void {
    if (this.forcedCollapsed()) return;
    this.manualCollapsed.update((v) => !v);
  }
}
