export interface PublicNewsListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
}

export interface PublicNewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  coverImageUrl: string | null;
  bodyHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
}

export interface PaginatedPublicNews {
  items: PublicNewsListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NewsListQuery {
  page?: number;
  limit?: number;
  category?: string;
}
