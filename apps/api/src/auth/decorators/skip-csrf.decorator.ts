import { SetMetadata } from '@nestjs/common';

export const SKIP_CSRF_KEY = 'skipCsrf';

/**
 * Opt a route out of double-submit CSRF verification. Rarely needed — the guard
 * already skips requests that carry no auth cookie — but available for a
 * cookie-bearing endpoint that must accept cross-site calls.
 */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
