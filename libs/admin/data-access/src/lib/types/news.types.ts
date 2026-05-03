export type NewsArticleStatus = 'DRAFT' | 'PUBLISHED';

export type NewsletterCampaignStatus =
  | 'NOT_SENT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'CANCELLED';

export type NewsletterCampaignType = 'TEST' | 'BULK';

export interface AdminNewsListItem {
  id: string;
  title: string;
  slug: string;
  status: NewsArticleStatus;
  category: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  lastSentAt: string | null;
  updatedAt: string;
}

export interface AdminNewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  coverImageUrl: string | null;
  bodyJson: Record<string, unknown>;
  bodyHtml: string;
  status: NewsArticleStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAdminNews {
  items: AdminNewsListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminNewsListQuery {
  page?: number;
  limit?: number;
  status?: NewsArticleStatus;
  search?: string;
}

export interface CreateNewsArticleRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  coverImageUrl?: string;
  bodyJson: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
}

export type UpdateNewsArticleRequest = Partial<CreateNewsArticleRequest>;

export interface UploadResponse {
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface NewsletterCampaign {
  id: string;
  articleId: string;
  type: NewsletterCampaignType;
  status: NewsletterCampaignStatus;
  subject: string;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  testRecipientEmail: string | null;
  createdAt: string;
}

export interface SendNewsletterRequest {
  scheduledAt?: string;
}

export interface TestSendNewsletterRequest {
  email: string;
}
