const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

/**
 * Parse a short duration string ("15m", "30d", "12h", "45s") into seconds.
 *
 * Used to keep JWT `expiresIn` and the matching cookie `maxAge` in lockstep. A
 * plain number (with no unit) is treated as seconds. Throws on unparseable input
 * so a typo in JWT_EXPIRES_IN / REFRESH_TOKEN_TTL surfaces at boot rather than
 * silently issuing a wrong-lived cookie.
 */
export function parseDurationToSeconds(value: string): number {
  const trimmed = value.trim();
  const match = /^(\d+)\s*(s|m|h|d)?$/i.exec(trimmed);

  if (!match) {
    throw new Error(
      `Invalid duration "${value}". Use a number optionally suffixed with s, m, h, or d.`
    );
  }

  const amount = parseInt(match[1], 10);
  if (amount < 1) {
    throw new Error(`Invalid duration "${value}". Must be at least 1 second.`);
  }
  const unit = (match[2] ?? 's').toLowerCase();

  return amount * UNIT_SECONDS[unit];
}
