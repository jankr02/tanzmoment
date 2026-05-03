import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SeoService } from '@tanzmoment/shared/services';
import { NewsApiService } from '../../services/news-api.service';
import {
  PaginatedPublicNews,
  PublicNewsListItem,
} from '../../types/news.types';
import { NewsCardComponent } from '../../components/news-card/news-card.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'tm-news-list-page',
  standalone: true,
  imports: [NgIf, NgFor, NewsCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-list-page.component.html',
  styleUrl: './news-list-page.component.scss',
})
export class NewsListPageComponent implements OnInit {
  private readonly api = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  readonly articles = signal<PublicNewsListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly hasMore = signal(false);
  readonly page = signal(1);

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.articles().length === 0,
  );

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'News & Aktuelles — Tanzmoment',
      description:
        'Aktuelle Neuigkeiten, Studio-Updates und Veranstaltungen von Tanzmoment.',
      url: '/news',
    });
    this.loadPage(1, true);
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.loadPage(this.page() + 1, false);
  }

  private loadPage(page: number, replace: boolean): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list({ page, limit: PAGE_SIZE }).subscribe({
      next: (res: PaginatedPublicNews) => {
        this.articles.update((current) =>
          replace ? res.items : [...current, ...res.items],
        );
        this.hasMore.set(res.hasMore);
        this.page.set(res.page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('News konnten nicht geladen werden. Bitte versuche es erneut.');
        this.loading.set(false);
      },
    });
  }
}
