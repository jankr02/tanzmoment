import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AdminApiService } from '@tanzmoment/admin/data-access';
import type {
  FinanceSummary,
  FinancePayment,
  FinanceListMeta,
  MonthlyRevenueStat,
} from '@tanzmoment/admin/data-access';
import { IconComponent } from '@tanzmoment/shared/ui';

@Component({
  selector: 'tm-admin-finance',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './admin-finance.component.html',
  styleUrls: ['./admin-finance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFinanceComponent implements OnInit, OnDestroy {
  private readonly adminApi = inject(AdminApiService);
  private readonly destroy$ = new Subject<void>();
  private readonly filterSubject$ = new Subject<void>();

  readonly loadingSummary = signal(true);
  readonly loadingPayments = signal(true);
  readonly loadingChart = signal(true);
  readonly error = signal<string | null>(null);

  readonly summary = signal<FinanceSummary | null>(null);
  readonly payments = signal<FinancePayment[]>([]);
  readonly meta = signal<FinanceListMeta | null>(null);
  readonly monthlyStats = signal<MonthlyRevenueStat[]>([]);

  readonly statusFilter = signal('');
  readonly fromFilter = signal('');
  readonly toFilter = signal('');
  readonly currentPage = signal(1);

  readonly exporting = signal(false);

  readonly isEmpty = computed(() => !this.loadingPayments() && this.payments().length === 0);
  readonly hasActiveFilters = computed(
    () => !!this.statusFilter() || !!this.fromFilter() || !!this.toFilter(),
  );

  readonly maxRevenue = computed(() => {
    const stats = this.monthlyStats();
    if (stats.length === 0) return 1;
    return Math.max(...stats.map((s) => s.revenue), 1);
  });

  readonly loading = computed(
    () => this.loadingSummary() || this.loadingPayments() || this.loadingChart(),
  );

  ngOnInit(): void {
    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.loadPayments());

    this.loadSummary();
    this.loadPayments();
    this.loadMonthlyStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadPayments();
  }

  onFromChange(event: Event): void {
    this.fromFilter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.filterSubject$.next();
  }

  onToChange(event: Event): void {
    this.toFilter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.filterSubject$.next();
  }

  onResetFilters(): void {
    this.statusFilter.set('');
    this.fromFilter.set('');
    this.toFilter.set('');
    this.currentPage.set(1);
    this.loadPayments();
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadPayments();
    }
  }

  onNextPage(): void {
    const m = this.meta();
    if (m && this.currentPage() < m.totalPages) {
      this.currentPage.update((p) => p + 1);
      this.loadPayments();
    }
  }

  onExportCSV(): void {
    if (this.exporting()) return;
    this.exporting.set(true);

    this.adminApi
      .exportFinanceCSV(
        this.fromFilter() || undefined,
        this.toFilter() || undefined,
      )
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.buildFilename();
          a.click();
          URL.revokeObjectURL(url);
          this.exporting.set(false);
        },
        error: () => {
          this.exporting.set(false);
        },
      });
  }

  getParticipantName(payment: FinancePayment): string {
    if (payment.user) return payment.user.name;
    return 'Gast';
  }

  getParticipantEmail(payment: FinancePayment): string {
    if (payment.user) return payment.user.email;
    return payment.guestEmail ?? '—';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PAID: 'Bezahlt',
      PENDING: 'Offen',
      REFUNDED: 'Erstattet',
      FAILED: 'Fehlgeschlagen',
      PARTIAL_REFUND: 'Teilerstattung',
      PROCESSING: 'In Bearbeitung',
      CANCELLED: 'Storniert',
    };
    return labels[status] ?? status;
  }

  getPaymentStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PAID: 'status--paid',
      PENDING: 'status--pending',
      REFUNDED: 'status--refunded',
      FAILED: 'status--failed',
      PARTIAL_REFUND: 'status--partial',
    };
    return classes[status] ?? 'status--default';
  }

  getMethodLabel(method: string | null): string {
    if (!method) return '—';
    const labels: Record<string, string> = {
      CREDIT_CARD: 'Kreditkarte',
      SEPA_DEBIT: 'SEPA',
      BANK_TRANSFER: 'Überweisung',
      CASH: 'Bar',
      PAYPAL: 'PayPal',
      FREE: 'Kostenlos',
    };
    return labels[method] ?? method;
  }

  formatEuro(cents: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatMonthLabel(isoMonth: string): string {
    const [year, month] = isoMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' }).format(date);
  }

  getBarHeight(revenue: number): number {
    const max = this.maxRevenue();
    return max > 0 ? Math.round((revenue / max) * 100) : 0;
  }

  trackByPayment(_index: number, payment: FinancePayment): string {
    return payment.id;
  }

  private loadSummary(): void {
    this.loadingSummary.set(true);
    this.adminApi.getFinanceSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadingSummary.set(false);
      },
      error: () => {
        this.error.set('Zusammenfassung konnte nicht geladen werden.');
        this.loadingSummary.set(false);
      },
    });
  }

  private loadPayments(): void {
    this.loadingPayments.set(true);
    const filters = {
      page: this.currentPage(),
      limit: 20,
      ...(this.statusFilter() ? { status: this.statusFilter() } : {}),
      ...(this.fromFilter() ? { from: this.fromFilter() } : {}),
      ...(this.toFilter() ? { to: this.toFilter() } : {}),
    };
    this.adminApi.getFinancePayments(filters).subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.meta.set(response.meta);
        this.loadingPayments.set(false);
      },
      error: () => {
        this.error.set('Zahlungen konnten nicht geladen werden.');
        this.loadingPayments.set(false);
      },
    });
  }

  private loadMonthlyStats(): void {
    this.loadingChart.set(true);
    this.adminApi.getMonthlyStats(12).subscribe({
      next: (stats) => {
        this.monthlyStats.set(stats);
        this.loadingChart.set(false);
      },
      error: () => {
        this.loadingChart.set(false);
      },
    });
  }

  private buildFilename(): string {
    const parts = ['zahlungen'];
    if (this.fromFilter()) parts.push(this.fromFilter());
    if (this.toFilter()) parts.push(this.toFilter());
    return `${parts.join('_')}.csv`;
  }
}
