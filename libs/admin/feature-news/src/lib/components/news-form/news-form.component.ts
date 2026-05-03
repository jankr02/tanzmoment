import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AdminNewsArticle,
  AdminNewsService,
  CreateNewsArticleRequest,
  NewsArticleStatus,
} from '@tanzmoment/admin/data-access';
import { CoverImageUploadComponent } from '../cover-image-upload/cover-image-upload.component';
import {
  SendModalSubmit,
  SendNewsletterModalComponent,
} from '../send-newsletter-modal/send-newsletter-modal.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import {
  TiptapBodyChange,
  TiptapEditorComponent,
} from '../tiptap-editor/tiptap-editor.component';

@Component({
  selector: 'admin-news-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TiptapEditorComponent,
    CoverImageUploadComponent,
    SendNewsletterModalComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.scss',
})
export class NewsFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AdminNewsService);

  readonly articleId = signal<string | null>(null);
  readonly status = signal<NewsArticleStatus>('DRAFT');
  readonly publishedAt = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly initialJson = signal<Record<string, unknown> | null>(null);
  readonly showSendModal = signal(false);
  readonly sending = signal(false);

  title = '';
  slug = '';
  excerpt = '';
  category = '';
  coverImageUrl: string | null = null;
  metaTitle = '';
  metaDescription = '';
  bodyJson: Record<string, unknown> | null = null;
  bodyHtml = '';

  readonly isNew = computed(() => this.articleId() === null);
  readonly canSend = computed(() => this.status() === 'PUBLISHED' && !!this.articleId());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'neu') {
      this.articleId.set(id);
      this.loadArticle(id);
    } else {
      this.initialJson.set({ type: 'doc', content: [{ type: 'paragraph' }] });
    }
  }

  onBodyChange(change: TiptapBodyChange): void {
    this.bodyJson = change.json;
    this.bodyHtml = change.html;
  }

  onCoverChange(url: string | null): void {
    this.coverImageUrl = url;
  }

  save(thenPublish = false): void {
    if (!this.title.trim()) {
      this.errorMessage.set('Bitte gib einen Titel ein.');
      return;
    }
    if (!this.bodyJson) {
      this.errorMessage.set('Der Inhalt darf nicht leer sein.');
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    const payload: CreateNewsArticleRequest = {
      title: this.title.trim(),
      slug: this.slug.trim() || undefined,
      excerpt: this.excerpt.trim() || undefined,
      category: this.category.trim() || undefined,
      coverImageUrl: this.coverImageUrl ?? undefined,
      bodyJson: this.bodyJson,
      metaTitle: this.metaTitle.trim() || undefined,
      metaDescription: this.metaDescription.trim() || undefined,
    };

    const id = this.articleId();
    const request$ = id ? this.api.update(id, payload) : this.api.create(payload);

    request$.subscribe({
      next: (article) => {
        this.applyArticle(article);
        this.saving.set(false);
        if (!id) {
          this.router.navigate(['/admin/news', article.id]);
        }
        if (thenPublish && article.status !== 'PUBLISHED') {
          this.togglePublish();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
        );
      },
    });
  }

  togglePublish(): void {
    const id = this.articleId();
    if (!id) return;
    this.saving.set(true);
    this.api.togglePublish(id).subscribe({
      next: (article) => {
        this.applyArticle(article);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Status konnte nicht geändert werden.');
      },
    });
  }

  openSend(): void {
    if (!this.canSend()) {
      this.errorMessage.set('Der Artikel muss veröffentlicht sein, um ihn zu versenden.');
      return;
    }
    this.showSendModal.set(true);
  }

  closeSend(): void {
    this.showSendModal.set(false);
  }

  onSend(payload: SendModalSubmit): void {
    const id = this.articleId();
    if (!id) return;
    this.sending.set(true);
    this.errorMessage.set(null);

    const handler =
      payload.mode === 'TEST'
        ? this.api.testSend(id, { email: payload.email! })
        : this.api.send(id, {
            scheduledAt: payload.mode === 'SCHEDULED' ? payload.scheduledAt : undefined,
          });

    handler.subscribe({
      next: () => {
        this.sending.set(false);
        this.showSendModal.set(false);
        const message =
          payload.mode === 'TEST'
            ? 'Test-Mail wurde versendet.'
            : payload.mode === 'SCHEDULED'
              ? 'Versand wurde geplant.'
              : 'Versand läuft.';
        window.alert(message);
      },
      error: (err) => {
        this.sending.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Versand fehlgeschlagen.');
      },
    });
  }

  private loadArticle(id: string): void {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (article) => {
        this.applyArticle(article);
        this.initialJson.set(article.bodyJson);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Artikel konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  private applyArticle(article: AdminNewsArticle): void {
    this.articleId.set(article.id);
    this.title = article.title;
    this.slug = article.slug;
    this.excerpt = article.excerpt ?? '';
    this.category = article.category ?? '';
    this.coverImageUrl = article.coverImageUrl;
    this.metaTitle = article.metaTitle ?? '';
    this.metaDescription = article.metaDescription ?? '';
    this.bodyJson = article.bodyJson;
    this.bodyHtml = article.bodyHtml;
    this.status.set(article.status);
    this.publishedAt.set(article.publishedAt);
  }
}
