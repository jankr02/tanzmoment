export { newsRoutes } from './lib/news.routes';
export { NewsListPageComponent } from './lib/pages/news-list-page/news-list-page.component';
export { NewsDetailPageComponent } from './lib/pages/news-detail-page/news-detail-page.component';
export { NewsCardComponent } from './lib/components/news-card/news-card.component';
export { NewsApiService } from './lib/services/news-api.service';
export type {
  PublicNewsListItem,
  PublicNewsArticle,
  PaginatedPublicNews,
  NewsListQuery,
} from './lib/types/news.types';
