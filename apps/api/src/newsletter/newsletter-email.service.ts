import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../config/email.config';
import { EmailService } from '../email/email.service';
import { EMAIL_SUBJECTS } from '../email/email.constants';

@Injectable()
export class NewsletterEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendDoubleOptIn(email: string, confirmToken: string): Promise<void> {
    await this.emailService.send(
      email,
      EMAIL_SUBJECTS['newsletter-doi'],
      'newsletter-doi',
      { confirmToken },
    );
  }

  async sendUnsubscribeConfirmation(email: string): Promise<void> {
    await this.emailService.send(
      email,
      EMAIL_SUBJECTS['newsletter-unsubscribed'],
      'newsletter-unsubscribed',
      {},
    );
  }

  async sendArticle(params: {
    email: string;
    subject: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    coverImageUrl: string | null;
    bodyHtml: string;
    unsubscribeToken: string;
  }): Promise<{ success: boolean; error?: string }> {
    const result = await this.emailService.send(
      params.email,
      params.subject,
      'newsletter-article',
      {
        title: params.title,
        slug: params.slug,
        excerpt: params.excerpt ?? '',
        category: params.category ?? '',
        coverImageUrl: params.coverImageUrl ?? '',
        bodyHtml: params.bodyHtml,
        unsubscribeToken: params.unsubscribeToken,
      },
    );
    return { success: result.success, error: result.error };
  }

  getBaseUrl(): string {
    const cfg = this.configService.get<EmailConfig>('email');
    return cfg?.baseUrl ?? 'http://localhost:4200';
  }
}
