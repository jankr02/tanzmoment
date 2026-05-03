import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '@tanzmoment/shared/services';
import { NewsApiService } from '../../services/news-api.service';
import { PublicNewsArticle } from '../../types/news.types';

@Component({
  selector: 'tm-news-detail-page',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-detail-page.component.html',
  styleUrl: './news-detail-page.component.scss',
})
export class NewsDetailPageComponent implements OnInit {
  private readonly api = inject(NewsApiService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly slug = input.required<string>();

  readonly article = signal<PublicNewsArticle | null>(null);
  readonly safeBody = signal<SafeHtml | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const slugValue = this.slug();
    this.api.getBySlug(slugValue).subscribe({
      next: (article) => {
        this.article.set(article);
        this.safeBody.set(this.sanitizer.bypassSecurityTrustHtml(article.bodyHtml));
        this.seo.setMetadata({
          title: article.metaTitle ?? `${article.title} — Tanzmoment`,
          description: article.metaDescription ?? article.excerpt ?? '',
          url: `/news/${article.slug}`,
          image: article.coverImageUrl ?? undefined,
        });
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }
}
