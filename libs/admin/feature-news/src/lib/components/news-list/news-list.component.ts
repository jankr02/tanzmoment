import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AdminNewsListItem,
  AdminNewsService,
  NewsArticleStatus,
} from '@tanzmoment/admin/data-access';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'admin-news-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
})
export class NewsListComponent implements OnInit {
  private readonly api = inject(AdminNewsService);
  private readonly router = inject(Router);

  readonly items = signal<AdminNewsListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<NewsArticleStatus | ''>('');
  search = '';

  readonly hasResults = computed(() => this.items().length > 0);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list({
        status: (this.statusFilter() as NewsArticleStatus) || undefined,
        search: this.search || undefined,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('News konnten nicht geladen werden.');
          this.loading.set(false);
        },
      });
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value as NewsArticleStatus | '');
    this.reload();
  }

  togglePublish(item: AdminNewsListItem, event: Event): void {
    event.stopPropagation();
    this.api.togglePublish(item.id).subscribe({
      next: () => this.reload(),
      error: () => window.alert('Status konnte nicht geändert werden.'),
    });
  }

  remove(item: AdminNewsListItem, event: Event): void {
    event.stopPropagation();
    if (!window.confirm(`Soll "${item.title}" wirklich gelöscht werden?`)) return;
    this.api.delete(item.id).subscribe({
      next: () => this.reload(),
      error: () => window.alert('Löschen fehlgeschlagen.'),
    });
  }

  open(item: AdminNewsListItem): void {
    this.router.navigate(['/admin/news', item.id]);
  }
}
