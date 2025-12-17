// ============================================================================
// COURSE FEATURE - SERVICES & COMPONENTS
// ============================================================================
// Export of all services and components for the course feature
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export { CourseFilterService } from './lib/services/course-filter.service';
export type {
  CourseListItem,
  CourseListResponse,
  PaginationMeta,
  LoadingState,
  FilterError,
} from './lib/services/course-filter.service';

export {
  FilterUrlSyncService,
  URL_PARAM_KEYS,
} from './lib/services/filter-url-sync.service';

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export { CourseOverviewComponent } from './lib/services/pages/course-overview.component';
