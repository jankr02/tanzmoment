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
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AdminApiService } from '@tanzmoment/admin/data-access';
import type {
  AdminCustomerListItem,
  CustomerListMeta,
} from '@tanzmoment/admin/data-access';
import { IconComponent } from '@tanzmoment/shared/ui';

@Component({
  selector: 'tm-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent implements OnInit, OnDestroy {
  private readonly adminApi = inject(AdminApiService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<void>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly customers = signal<AdminCustomerListItem[]>([]);
  readonly meta = signal<CustomerListMeta | null>(null);

  readonly searchFilter = signal('');
  readonly currentPage = signal(1);

  readonly isEmpty = computed(() => !this.loading() && this.customers().length === 0);
  readonly hasSearch = computed(() => this.searchFilter().trim().length > 0);

  ngOnInit(): void {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.loadCustomers());

    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchFilter.set(value);
    this.currentPage.set(1);
    this.searchSubject$.next();
  }

  onClearSearch(): void {
    this.searchFilter.set('');
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadCustomers();
    }
  }

  onNextPage(): void {
    const m = this.meta();
    if (m && this.currentPage() < m.totalPages) {
      this.currentPage.update((p) => p + 1);
      this.loadCustomers();
    }
  }

  getFullName(customer: AdminCustomerListItem): string {
    return `${customer.firstName} ${customer.lastName}`;
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatRelativeDate(date: string | Date | null): string {
    if (!date) return '—';
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'heute';
    if (diffDays === 1) return 'gestern';
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
    return this.formatDate(date);
  }

  trackByCustomer(_index: number, customer: AdminCustomerListItem): string {
    return customer.id;
  }

  private loadCustomers(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters = {
      page: this.currentPage(),
      limit: 20,
      ...(this.searchFilter().trim() ? { search: this.searchFilter().trim() } : {}),
    };

    this.adminApi.getCustomers(filters).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Teilnehmer konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }
}
