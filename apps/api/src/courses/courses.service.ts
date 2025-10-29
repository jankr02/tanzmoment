import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseListItemDto } from './dto/course-list.dto';
import { CourseDetailDto, SessionDto } from './dto/course-detail.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /courses - Liste aller veröffentlichten Kurse
   */
  async findAll(): Promise<CourseListItemDto[]> {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      include: {
        sessions: {
          where: {
            startTime: { gte: new Date() }, // Nur zukünftige Sessions
            status: 'SCHEDULED',
          },
          orderBy: { startTime: 'asc' },
          take: 1, // Nur die nächste Session
        },
      },
      orderBy: [
        { isMarkedAsHighlighted: 'desc' }, // Highlighted zuerst
        { createdAt: 'desc' },
      ],
    });

    return courses.map((course) => ({
      id: course.id,
      slug: course.slug,
      isMarkedAsHighlighted: course.isMarkedAsHighlighted,
      danceStyle: course.danceStyle,
      catchPhrase: course.catchPhrase || undefined,
      courseTitle: course.title,
      courseDescription: course.shortDescription,
      dateTime: course.sessions[0]?.startTime.toISOString() || '',
      location: course.sessions[0]?.location || 'TBA',
      price: course.priceInCents / 100, // Cents → Euro
      targetGroup: course.targetGroup,
      imageUrl: course.imageUrl || undefined,
    }));
  }

  /**
   * GET /courses/:slug - Detailansicht eines Kurses
   */
  async findBySlug(slug: string): Promise<CourseDetailDto> {
    const course = await this.prisma.course.findUnique({
      where: { slug, isPublished: true },
      include: {
        instructor: {
          include: {
            user: true,
          },
        },
        sessions: {
          where: {
            startTime: { gte: new Date() },
          },
          orderBy: { startTime: 'asc' },
          include: {
            _count: {
              select: { bookings: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with slug "${slug}" not found`);
    }

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      catchPhrase: course.catchPhrase || undefined,
      shortDescription: course.shortDescription,
      description: course.description,
      danceStyle: course.danceStyle,
      targetGroup: course.targetGroup,
      level: course.level,
      maxParticipants: course.maxParticipants,
      priceInCents: course.priceInCents,
      price: course.priceInCents / 100,
      duration: course.duration,
      imageUrl: course.imageUrl || undefined,
      isMarkedAsHighlighted: course.isMarkedAsHighlighted,
      isPublished: course.isPublished,
      instructor: {
        id: course.instructor.id,
        firstName: course.instructor.user.firstName,
        lastName: course.instructor.user.lastName,
        bio: course.instructor.bio || undefined,
        imageUrl: course.instructor.imageUrl || undefined,
        expertise: course.instructor.expertise,
      },
      sessions: course.sessions.map((session) => ({
        id: session.id,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        location: session.location,
        status: session.status,
        availableSpots: course.maxParticipants - session._count.bookings,
      })),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }
}
