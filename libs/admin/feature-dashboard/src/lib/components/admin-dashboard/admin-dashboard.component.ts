import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '@tanzmoment/shared/ui';
import { AuthStateService } from '@tanzmoment/shared/services';
import {
  AdminApiService,
  DashboardResponse,
  SessionSummary,
} from '@tanzmoment/admin/data-access';

@Component({
  selector: 'tm-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, DatePipe, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly authState = inject(AuthStateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<DashboardResponse | null>(null);

  readonly greeting = computed(() => {
    const user = this.authState.user();
    const hour = new Date().getHours();
    let timeGreeting = 'Guten Tag';
    if (hour < 12) timeGreeting = 'Guten Morgen';
    else if (hour >= 18) timeGreeting = 'Guten Abend';

    return user ? `${timeGreeting}, ${user.firstName}` : timeGreeting;
  });

  readonly actionItems = computed(() => {
    const d = this.data();
    if (!d) return [];

    const items: { label: string; count: number; icon: string; severity: 'info' | 'warning' | 'danger' }[] = [];

    if (d.pendingBookings > 0) {
      items.push({
        label: 'Offene Buchungen',
        count: d.pendingBookings,
        icon: 'clipboard-list',
        severity: 'warning',
      });
    }
    if (d.waitlistEntries > 0) {
      items.push({
        label: 'Warteliste',
        count: d.waitlistEntries,
        icon: 'users',
        severity: 'info',
      });
    }
    if (d.unpaidBookings > 0) {
      items.push({
        label: 'Unbezahlte Buchungen',
        count: d.unpaidBookings,
        icon: 'wallet',
        severity: 'danger',
      });
    }
    if (d.emptySessions.length > 0) {
      items.push({
        label: 'Leere Sessions',
        count: d.emptySessions.length,
        icon: 'calendar-x',
        severity: 'warning',
      });
    }

    return items;
  });

  readonly upcomingSessions = computed(() => this.data()?.upcomingSessions ?? []);
  readonly stats = computed(() => this.data()?.stats ?? null);

  readonly revenueFormatted = computed(() => {
    const s = this.stats();
    if (!s) return '0,00';
    return (s.revenueThisMonth / 100).toFixed(2).replace('.', ',');
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminApi.getDashboard().subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Dashboard konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  getOccupancyClass(occupancy: number): string {
    if (occupancy >= 80) return 'occupancy--high';
    if (occupancy >= 50) return 'occupancy--medium';
    return 'occupancy--low';
  }

  trackSession(_index: number, session: SessionSummary): string {
    return session.id;
  }
}
