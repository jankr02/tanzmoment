import { CourseDetailData } from '@tanzmoment/shared/course-detail-ui';
import {
  BookingMode,
  CourseDetailContent,
} from '@tanzmoment/shared/types';
import { AdminSession } from '@tanzmoment/admin/data-access';

/**
 * Editor form state relevant for the live preview. Mirrors the reactive form
 * of the course editor (raw values), independent of Angular form typing.
 */
export interface CoursePreviewFormState {
  title: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  shortDescription: string;
  description: string;
  catchPhrase: string;
  imageUrl: string;
  priceInEuros: number;
  isFree: boolean;
  duration: number;
  maxParticipants: number;
  bookingMode: string;
  visibility: string;
  metaTitle: string;
  metaDescription: string;
}

export interface CoursePreviewInput {
  form: CoursePreviewFormState;
  detailContent: CourseDetailContent;
  sessions: AdminSession[];
  instructor: { id: string; firstName: string; lastName: string } | null;
}

const DATE_FORMAT = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const TIME_FORMAT = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatPrice(priceInEuros: number, isFree: boolean): string {
  if (isFree) return 'Kostenlos';
  return `${priceInEuros.toFixed(2).replace('.', ',')} €`;
}

function mapSession(
  session: AdminSession,
  labels: Record<string, string> | undefined,
): CourseDetailData['sessions'][number] {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const availableSpots = Math.max(
    0,
    session.maxParticipants - session.bookedCount,
  );

  return {
    id: session.id,
    startTime: session.startTime,
    endTime: session.endTime,
    location: session.locationName,
    status: session.status,
    formattedDate: DATE_FORMAT.format(start),
    formattedTime: `${TIME_FORMAT.format(start)} – ${TIME_FORMAT.format(end)}`,
    availableSpots,
    isFullyBooked: availableSpots <= 0,
    label: labels?.[session.id],
  };
}

/**
 * Maps live editor state onto the CourseDetailData shape consumed by the
 * shared course-detail section components, so the editor canvas renders a
 * 1:1 preview of the published course page. Computed fields (price, spots,
 * formatted session dates) are derived the same way the public API would.
 */
export function buildCoursePreview(input: CoursePreviewInput): CourseDetailData {
  const { form, detailContent, sessions, instructor } = input;

  const sessionLabels = detailContent.schedule?.sessionLabels;
  const mappedSessions = sessions.map((s) => mapSession(s, sessionLabels));

  const nextSession = mappedSessions[0];
  const availableSpots = nextSession?.availableSpots ?? form.maxParticipants;
  const isFullyBooked =
    mappedSessions.length > 0 && mappedSessions.every((s) => s.isFullyBooked);

  const instructorContent = detailContent.instructor;

  return {
    id: 'preview',
    slug: 'preview',
    title: form.title,
    catchPhrase: form.catchPhrase || undefined,
    shortDescription: form.shortDescription,
    description: form.description,
    danceStyle: form.danceStyle,
    targetGroup: form.targetGroup,
    level: form.level,
    duration: form.duration,
    maxParticipants: form.maxParticipants,
    bookingMode: form.bookingMode as BookingMode,
    priceInCents: Math.round(form.priceInEuros * 100),
    price: form.priceInEuros,
    priceFormatted: formatPrice(form.priceInEuros, form.isFree),
    imageUrl: form.imageUrl || undefined,

    detailContent,

    metaTitle: form.metaTitle || undefined,
    metaDescription: form.metaDescription || undefined,

    instructor: {
      id: instructor?.id ?? 'preview-instructor',
      firstName: instructor?.firstName ?? '',
      lastName: instructor?.lastName ?? '',
      imageUrl: instructorContent?.imageOverride,
      expertise: [],
    },
    sessions: mappedSessions,

    totalUpcomingSessions: mappedSessions.length,
    availableSpots,
    isFullyBooked,
  };
}
