/**
 * Trims a string and collapses empty values to undefined, so blank CMS fields
 * are omitted from detailContent (sections then fall back to base course data).
 */
export function clean(value: string | undefined | null): string | undefined {
  return value?.trim() || undefined;
}

/**
 * Returns the object only if at least one property carries a value; otherwise
 * undefined so an entirely empty section is dropped from detailContent.
 */
export function nonEmpty<T extends object>(obj: T): T | undefined {
  const hasValue = Object.values(obj).some((v) =>
    Array.isArray(v)
      ? v.length > 0
      : v !== undefined && v !== null && v !== '',
  );
  return hasValue ? obj : undefined;
}
