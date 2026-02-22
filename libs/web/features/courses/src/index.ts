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

export { CourseDetailService } from './lib/services/course-detail.service';

// ─────────────────────────────────────────────────────────────────────────────
// COURSE DETAIL TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CourseDetailData,
  CourseDetailSession,
  CourseDetailInstructor,
  CourseDetailTheme,
} from './lib/types/course-detail.types';
export { COURSE_DETAIL_THEMES } from './lib/types/course-detail.types';

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export { CourseOverviewComponent } from './lib/services/pages/course-overview.component';

export { CourseDetailComponent } from './lib/pages/course-detail/course-detail.component';
