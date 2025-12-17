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
    location: string;
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
            take: 10, // Limit for performance
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
        },
      },
    });

    return courses.map((course) =>
      this.transformToListItem(course as unknown as CourseWithRelations)
    );
  }

  /**
   * Get single course by slug
   *
   * @param slug - Course URL slug
   * @returns Course details or null
   */
  async findBySlug(slug: string) {
    return this.prisma.course.findUnique({
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
        },
      },
    });
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

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

    // Location filter (partial match for flexibility)
    if (query.location) {
      // Map location ID to actual location name
      const locationMap: Record<string, string> = {
        moessingen: 'Mössingen',
        bodelshausen: 'Bodelshausen',
      };
      const locationName = locationMap[query.location];
      if (locationName) {
        sessionFilter.location = {
          contains: locationName,
          mode: 'insensitive',
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
        ? 'Kostenlos'
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
            location: nextSession.location,
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
