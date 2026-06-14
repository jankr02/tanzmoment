const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Known placeholder secrets that must never reach a running environment.
 * Compared case-insensitively. Extend this list if new placeholders appear
 * in .env.example.
 */
const PLACEHOLDER_JWT_SECRETS = new Set([
  'your-super-secret-jwt-key-change-in-production',
  'your-super-secret-jwt-key-change-in-production-tanzmoment-2025',
]);

/**
 * Fail-fast environment validation executed at module initialization.
 *
 * The JWT is signed with a symmetric HS256 secret, so a missing, short, or
 * placeholder JWT_SECRET would let anyone forge admin tokens. Refusing to boot
 * is safer than silently running with a guessable signing key. Skipped under
 * NODE_ENV=test so the test harness is not forced to provision a real secret.
 */
export function validateEnv(
  config: Record<string, unknown>
): Record<string, unknown> {
  if (config['NODE_ENV'] === 'test') {
    return config;
  }

  const jwtSecret = config['JWT_SECRET'];

  if (typeof jwtSecret !== 'string' || jwtSecret.length === 0) {
    throw new Error('JWT_SECRET is not set. Refusing to start.');
  }

  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET is too short (${jwtSecret.length} chars, need >= ${MIN_JWT_SECRET_LENGTH}). ` +
        'Generate one with: openssl rand -base64 48'
    );
  }

  const normalized = jwtSecret.toLowerCase();
  if (
    PLACEHOLDER_JWT_SECRETS.has(normalized) ||
    normalized.includes('change_me') ||
    normalized.includes('change-in-production')
  ) {
    throw new Error(
      'JWT_SECRET is set to a known placeholder value. ' +
        'Generate a unique secret with: openssl rand -base64 48'
    );
  }

  return config;
}
