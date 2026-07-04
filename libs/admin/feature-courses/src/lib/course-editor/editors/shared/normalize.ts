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

// ─────────────────────────────────────────────────────────────────────────────
// SAVE-TIME SANITIZATION
// ─────────────────────────────────────────────────────────────────────────────
// The section editors keep in-progress (possibly empty) rows in the live signal
// so the preview reflects edits immediately. Before persisting, empty rows are
// stripped and sections that collapse to nothing are dropped.

import { CourseDetailContent } from '@tanzmoment/shared/types';

/**
 * Removes empty list rows and drops sections that end up carrying no data, so a
 * half-filled section never reaches the API / public page.
 */
export function sanitizeDetailContent(
  content: CourseDetailContent,
): CourseDetailContent {
  const out: CourseDetailContent = { ...content };

  if (out.quickFacts) {
    const customFacts = (out.quickFacts.customFacts ?? []).filter(
      (f) => f.label.trim() && f.value.trim(),
    );
    out.quickFacts = nonEmpty({
      ...out.quickFacts,
      customFacts: customFacts.length ? customFacts : undefined,
    });
  }

  if (out.description) {
    const highlights = (out.description.highlights ?? []).filter((h) =>
      h.text.trim(),
    );
    out.description = nonEmpty({
      ...out.description,
      highlights: highlights.length ? highlights : undefined,
    });
  }

  if (out.courseFlow) {
    const steps = (out.courseFlow.steps ?? []).filter(
      (s) => s.phase.trim() || s.description.trim(),
    );
    out.courseFlow = nonEmpty({
      ...out.courseFlow,
      steps: steps.length ? steps : undefined,
    });
  }

  if (out.instructor) {
    const qualifications = (out.instructor.qualifications ?? [])
      .map((q) => q.trim())
      .filter(Boolean);
    out.instructor = nonEmpty({
      ...out.instructor,
      qualifications: qualifications.length ? qualifications : undefined,
    });
  }

  if (out.socialProof) {
    const testimonials = (out.socialProof.testimonials ?? []).filter(
      (t) => t.text.trim() && t.authorName.trim(),
    );
    out.socialProof = nonEmpty({
      ...out.socialProof,
      testimonials: testimonials.length ? testimonials : undefined,
    });
  }

  if (out.faq) {
    const items = (out.faq.items ?? []).filter(
      (f) => f.question.trim() && f.answer.trim(),
    );
    out.faq = nonEmpty({ ...out.faq, items: items.length ? items : undefined });
  }

  if (out.booking) {
    const includes = (out.booking.includes ?? [])
      .map((i) => i.trim())
      .filter(Boolean);
    out.booking = nonEmpty({
      ...out.booking,
      includes: includes.length ? includes : undefined,
    });
  }

  for (const key of Object.keys(out) as (keyof CourseDetailContent)[]) {
    if (out[key] === undefined) {
      delete out[key];
    }
  }

  return out;
}
