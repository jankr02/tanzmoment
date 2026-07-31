/**
 * Courses Service
 *
 * Business logic for course operations including
 * filtering, pagination, and data transformation.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseQueryDto } from './dto/course-query.dto';
import {
  CourseListItemDto,
  PaginatedCoursesResponseDto,
  PaginationMetaDto,
} from './dto/course-response.dto';
import {
  CourseDetailResponseDto,
  CourseDetailInstructorDto,
  CourseDetailSessionDto,
} from './dto/course-detail-response.dto';
import { SessionAvailabilityDto } from './dto/session-availability.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CalendarSessionDto } from './dto/calendar-session.dto';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Course with included relations from Prisma query
 */
interface CourseWithRelations {
  id: string;
  slug: string;
  title: string;
  catchPhrase: string | null;
  shortDescription: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  duration: number;
  priceInCents: number;
  isFree: boolean;
  imageUrl: string | null;
  isMarkedAsHighlighted: boolean;
  maxParticipants: number;
  instructor: {
    id: string;
    imageUrl: string | null;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  sessions: Array<{
    startTime: Date;
    endTime: Date;
    location: { name: string };
  }>;
}

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Get paginated list of courses with optional filters
   *
   * @param query - Filter and pagination parameters
   * @returns Paginated courses response
   */
  async findAll(query: CourseQueryDto): Promise<PaginatedCoursesResponseDto> {
    const { page = 1, limit = 5 } = query;
    const skip = (page - 1) * limit;

    // Build where clause from filters
    const where = this.buildWhereClause(query);

    // Execute count and find in parallel
    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isMarkedAsHighlighted: 'desc' }, // Highlighted first
          { createdAt: 'desc' }, // Then newest
        ],
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          sessions: {
            where: {
              startTime: { gte: new Date() },
              status: 'SCHEDULED',
            },
            orderBy: { startTime: 'asc' },
            take: 10,
            include: { location: { select: { name: true } } },
          },
        },
      }),
    ]);

    // Transform to DTOs
    const data = courses.map((course) =>
      this.transformToListItem(course as unknown as CourseWithRelations)
    );

    // Build pagination meta
    const meta = this.buildPaginationMeta(total, page, limit);

    return { data, meta };
  }

  /**
   * Get only highlighted/featured courses
   *
   * @param limit - Maximum number of courses to return
   * @returns Array of highlighted courses
   */
  async findHighlighted(limit = 3): Promise<CourseListItemDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        isMarkedAsHighlighted: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        sessions: {
          where: {
            startTime: { gte: new Date() },
            status: 'SCHEDULED',
          },
          orderBy: { startTime: 'asc' },
          take: 1,
          include: { location: { select: { name: true } } },
        },
      },
    });

    return courses.map((course) =>
      this.transformToListItem(course as unknown as CourseWithRelations)
    );
  }

  /**
   * Get single course by slug with full detail data
   *
   * Includes:
   * - Instructor with bio and expertise
   * - All upcoming sessions with booking counts
   * - CMS detailContent
   * - Computed availability
   *
   * @param slug - Course URL slug
   * @returns CourseDetailResponseDto or null
   */
  async findBySlug(slug: string): Promise<CourseDetailResponseDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        sessions: {
          where: {
            startTime: { gte: new Date() },
            status: 'SCHEDULED',
          },
          orderBy: { startTime: 'asc' },
          include: {
            location: { select: { name: true } },
            _count: {
              select: {
                bookings: {
                  where: {
                    status: { in: ['PENDING', 'CONFIRMED'] },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    return this.transformToDetail(course);
  }

  /**
   * Get all sessions for a course with availability information.
   *
   * Returns session-level booking data for the booking flow:
   * - Available spots per session
   * - Waitlist count
   * - Whether the current user has already booked
   *
   * @param courseId - Course ID
   * @param userId - Optional user ID (for userHasBooking check)
   * @returns Array of sessions with availability data
   */
  async getSessionsWithAvailability(
    courseId: string,
    userId?: string,
  ): Promise<SessionAvailabilityDto[]> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        maxParticipants: true,
      },
    });

    if (!course) {
      return [];
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        courseId,
        status: 'SCHEDULED',
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
      include: {
        location: { select: { name: true } },
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
              },
            },
          },
        },
      },
    });

    const result: SessionAvailabilityDto[] = [];

    for (const session of sessions) {
      const bookedCount = session._count.bookings;
      const availableSpots = Math.max(0, course.maxParticipants - bookedCount);

      const waitlistCount = await this.prisma.booking.count({
        where: {
          sessionId: session.id,
          status: 'WAITLISTED',
        },
      });

      let userHasBooking = false;
      if (userId) {
        const userBooking = await this.prisma.booking.findFirst({
          where: {
            sessionId: session.id,
            userId,
            status: { in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] },
          },
        });
        userHasBooking = !!userBooking;
      }

      result.push({
        id: session.id,
        courseId: session.courseId,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        location: session.location.name,
        status: session.status,
        maxParticipants: course.maxParticipants,
        bookedCount,
        availableSpots,
        userHasBooking,
        waitlistCount,
      });
    }

    return result;
  }

  /**
   * Get all scheduled sessions across all published courses within a date range,
   * enriched with course metadata and real-time availability.
   * Powers the public course-schedule calendar page.
   *
   * @param query - Date range (dateFrom/dateTo) and optional danceStyle filter
   * @returns Array of calendar sessions sorted chronologically
   */
  async getCalendarSessions(
    query: CalendarQueryDto,
  ): Promise<CalendarSessionDto[]> {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date();
    const dateTo = query.dateTo
      ? new Date(query.dateTo)
      : new Date(dateFrom.getTime() + 42 * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: { gte: dateFrom, lte: dateTo },
        course: {
          isPublished: true,
          ...(query.danceStyle ? { danceStyle: query.danceStyle } : {}),
        },
      },
      orderBy: { startTime: 'asc' },
      include: {
        location: { select: { name: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            catchPhrase: true,
            danceStyle: true,
            targetGroup: true,
            level: true,
            imageUrl: true,
            maxParticipants: true,
            instructor: {
              select: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        _count: {
          select: {
            bookings: {
              where: { status: { in: ['PENDING', 'CONFIRMED'] } },
            },
          },
        },
      },
    });

    return sessions.map((session) => {
      const bookedCount = session._count.bookings;
      const availableSpots = Math.max(
        0,
        session.course.maxParticipants - bookedCount,
      );

      return {
        id: session.id,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        location: session.location.name,
        maxParticipants: session.course.maxParticipants,
        availableSpots,
        course: {
          id: session.course.id,
          title: session.course.title,
          slug: session.course.slug,
          catchPhrase: session.course.catchPhrase ?? undefined,
          danceStyle: session.course.danceStyle,
          targetGroup: session.course.targetGroup,
          level: session.course.level,
          imageUrl: session.course.imageUrl ?? undefined,
          instructorName: `${session.course.instructor.user.firstName} ${session.course.instructor.user.lastName}`,
        },
      };
    });
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Transform Prisma course to detail response DTO
   */
  private transformToDetail(course: any): CourseDetailResponseDto {
    const priceInEuros = course.priceInCents / 100;
    const priceFormatted =
      priceInEuros === 0
        ? course.isFree
          ? 'Kostenlos'
          : 'Auf Anfrage'
        : `${priceInEuros.toFixed(0)} €`;

    const detailContent = course.detailContent as Record<string, any> | null;
    const scheduleContent = detailContent?.schedule as
      | { sessionLabels?: Record<string, string> }
      | undefined;

    const sessions: CourseDetailSessionDto[] = course.sessions.map(
      (session: any) => {
        const bookedCount = session._count?.bookings ?? 0;
        const availableSpots = Math.max(
          0,
          course.maxParticipants - bookedCount
        );
        const isFullyBooked = availableSpots === 0;

        return {
          id: session.id,
          startTime: session.startTime,
          endTime: session.endTime,
          location: session.location.name,
          status: session.status,
          formattedDate: this.formatSessionDateTime(session.startTime),
          formattedTime: this.formatSessionTimeRange(
            session.startTime,
            session.endTime
          ),
          availableSpots,
          isFullyBooked,
          label: scheduleContent?.sessionLabels?.[session.id] ?? undefined,
        };
      }
    );

    const nextSession = sessions[0];
    const overallAvailable = nextSession?.availableSpots ?? 0;
    const isFullyBooked =
      sessions.length > 0 && sessions.every((s) => s.isFullyBooked);

    const instructor: CourseDetailInstructorDto = {
      id: course.instructor.id,
      firstName: course.instructor.user.firstName,
      lastName: course.instructor.user.lastName,
      bio: course.instructor.bio ?? undefined,
      imageUrl: course.instructor.imageUrl ?? undefined,
      expertise: course.instructor.expertise ?? [],
    };

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      catchPhrase: course.catchPhrase ?? undefined,
      shortDescription: course.shortDescription,
      description: course.description,
      danceStyle: course.danceStyle,
      targetGroup: course.targetGroup,
      level: course.level,
      duration: course.duration,
      maxParticipants: course.maxParticipants,
      bookingMode: course.bookingMode,
      priceInCents: course.priceInCents,
      price: priceInEuros,
      priceFormatted,
      imageUrl: course.imageUrl ?? undefined,
      detailContent: detailContent ?? undefined,
      metaTitle: course.metaTitle ?? undefined,
      metaDescription: course.metaDescription ?? undefined,
      ogImageUrl: course.ogImageUrl ?? undefined,
      instructor,
      sessions,
      totalUpcomingSessions: sessions.length,
      availableSpots: overallAvailable,
      isFullyBooked,
    };
  }

  /**
   * Format session time range
   * Example: "17:00 – 18:30"
   */
  private formatSessionTimeRange(start: Date, end: Date): string {
    const format = (d: Date) => {
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    };
    return `${format(new Date(start))} – ${format(new Date(end))}`;
  }

  /**
   * Build Prisma where clause from query parameters
   */
  private buildWhereClause(query: CourseQueryDto): Record<string, unknown> {
    const where: Record<string, unknown> = {
      isPublished: true, // Always filter to published only
    };

    // Dance style filter
    if (query.danceStyle) {
      where.danceStyle = query.danceStyle;
    }

    // Highlighted filter
    if (query.highlighted === true) {
      where.isMarkedAsHighlighted = true;
    }

    // Location and date filters require session filtering
    if (query.location || query.dateFrom || query.dateTo) {
      where.sessions = {
        some: this.buildSessionFilter(query),
      };
    }

    return where;
  }

  /**
   * Build session filter for location/date filtering
   */
  private buildSessionFilter(query: CourseQueryDto): Record<string, unknown> {
    const sessionFilter: Record<string, unknown> = {
      status: 'SCHEDULED',
    };

    // Location filter via relation
    if (query.location) {
      const locationMap: Record<string, string> = {
        moessingen: 'Mössingen',
        bodelshausen: 'Bodelshausen',
      };
      const locationName = locationMap[query.location];
      if (locationName) {
        sessionFilter.location = {
          name: { contains: locationName, mode: 'insensitive' },
        };
      }
    }

    // Date from filter
    if (query.dateFrom) {
      sessionFilter.startTime = {
        ...(sessionFilter.startTime as object),
        gte: new Date(query.dateFrom),
      };
    }

    // Date to filter
    if (query.dateTo) {
      sessionFilter.startTime = {
        ...(sessionFilter.startTime as object),
        lte: new Date(query.dateTo),
      };
    }

    return sessionFilter;
  }

  /**
   * Transform Prisma course to list item DTO
   */
  private transformToListItem(course: CourseWithRelations): CourseListItemDto {
    const nextSession = course.sessions?.[0];
    const upcomingSessionCount = course.sessions?.length ?? 0;

    // Convert price from cents to euros
    const priceInEuros = course.priceInCents / 100;
    const priceFormatted =
      priceInEuros === 0
        ? course.isFree
          ? 'Kostenlos'
          : 'Auf Anfrage'
        : `${priceInEuros.toFixed(0)} €`;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      catchPhrase: course.catchPhrase ?? undefined,
      shortDescription: course.shortDescription,
      danceStyle: course.danceStyle,
      targetGroup: course.targetGroup,
      level: course.level,
      duration: course.duration,
      priceInCents: course.priceInCents,
      price: priceInEuros,
      priceFormatted,
      imageUrl: course.imageUrl ?? undefined,
      isMarkedAsHighlighted: course.isMarkedAsHighlighted,
      isHighlighted: course.isMarkedAsHighlighted,
      maxParticipants: course.maxParticipants,
      instructor: {
        id: course.instructor.id,
        firstName: course.instructor.user.firstName,
        lastName: course.instructor.user.lastName,
        imageUrl: course.instructor.imageUrl ?? undefined,
      },
      nextSession: nextSession
        ? {
            startTime: nextSession.startTime,
            endTime: nextSession.endTime,
            startsAt: this.formatSessionDateTime(nextSession.startTime),
            location: nextSession.location.name,
          }
        : undefined,
      upcomingSessionCount,
    };
  }

  /**
   * Format session date/time for display
   * Example: "Mi, 18.12. • 17:00 Uhr"
   */
  private formatSessionDateTime(date: Date): string {
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const d = new Date(date);

    const weekday = weekdays[d.getDay()];
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${weekday}, ${day}.${month}. • ${hours}:${minutes} Uhr`;
  }

  /**
   * Build pagination metadata
   */
  private buildPaginationMeta(
    total: number,
    page: number,
    limit: number
  ): PaginationMetaDto {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }
}
