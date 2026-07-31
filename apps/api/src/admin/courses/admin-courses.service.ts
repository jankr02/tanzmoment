import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminCourseQueryDto } from './dto/admin-course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  AdminCourseListItemDto,
  AdminCourseDetailDto,
  AdminSessionDto,
  PaginatedAdminCoursesResponseDto,
} from './dto/admin-course-response.dto';

@Injectable()
export class AdminCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: AdminCourseQueryDto,
  ): Promise<PaginatedAdminCoursesResponseDto> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(query);

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          instructor: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          _count: {
            select: {
              sessions: true,
              bookings: true,
            },
          },
          sessions: {
            where: {
              startTime: { gte: new Date() },
              status: 'SCHEDULED',
            },
            select: { id: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: courses.map((course) => this.transformToListItem(course)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  async findById(id: string): Promise<AdminCourseDetailDto> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        sessions: {
          orderBy: { startTime: 'asc' },
          include: {
            location: { select: { id: true, name: true } },
            _count: {
              select: {
                bookings: {
                  where: { status: { in: ['PENDING', 'CONFIRMED'] } },
                },
              },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.transformToDetail(course);
  }

  async create(
    dto: CreateCourseDto,
    adminUserId: string,
  ): Promise<AdminCourseDetailDto> {
    const instructorId = await this.resolveInstructorId(
      dto.instructorId,
      adminUserId,
    );

    const slug = await this.ensureUniqueSlug(this.generateSlug(dto.title));

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        danceStyle: dto.danceStyle,
        targetGroup: dto.targetGroup,
        level: dto.level,
        duration: dto.duration,
        maxParticipants: dto.maxParticipants,
        priceInCents: Math.round(dto.priceInEuros * 100),
        bookingMode: dto.bookingMode,
        catchPhrase: dto.catchPhrase,
        imageUrl: dto.imageUrl,
        isFree: dto.isFree ?? false,
        visibility: dto.visibility ?? 'PUBLIC',
        isMarkedAsHighlighted: dto.isMarkedAsHighlighted ?? false,
        instructorId,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        cancellationPolicyId: dto.cancellationPolicyId || undefined,
        detailContent: dto.detailContent
          ? (dto.detailContent as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: 'DRAFT',
        isPublished: false,
      },
    });

    return this.findById(course.id);
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
  ): Promise<AdminCourseDetailDto> {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
      if (dto.title !== existing.title) {
        data.slug = await this.ensureUniqueSlug(
          this.generateSlug(dto.title),
          id,
        );
      }
    }
    if (dto.shortDescription !== undefined) data.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.danceStyle !== undefined) data.danceStyle = dto.danceStyle;
    if (dto.targetGroup !== undefined) data.targetGroup = dto.targetGroup;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.maxParticipants !== undefined) data.maxParticipants = dto.maxParticipants;
    if (dto.priceInEuros !== undefined) data.priceInCents = Math.round(dto.priceInEuros * 100);
    if (dto.bookingMode !== undefined) data.bookingMode = dto.bookingMode;
    if (dto.catchPhrase !== undefined) data.catchPhrase = dto.catchPhrase;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.isFree !== undefined) data.isFree = dto.isFree;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    if (dto.isMarkedAsHighlighted !== undefined) data.isMarkedAsHighlighted = dto.isMarkedAsHighlighted;
    if (dto.instructorId !== undefined) data.instructorId = dto.instructorId;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.cancellationPolicyId !== undefined) data.cancellationPolicyId = dto.cancellationPolicyId || null;
    if (dto.detailContent !== undefined) {
      data.detailContent = dto.detailContent
        ? (dto.detailContent as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    }

    await this.prisma.course.update({ where: { id }, data });

    return this.findById(id);
  }

  async archive(id: string): Promise<void> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.prisma.course.update({
      where: { id },
      data: { status: 'ARCHIVED', isPublished: false },
    });
  }

  async togglePublish(
    id: string,
  ): Promise<{ isPublished: boolean; status: string }> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.isPublished) {
      await this.prisma.course.update({
        where: { id },
        data: { isPublished: false, status: 'PAUSED' },
      });
      return { isPublished: false, status: 'PAUSED' };
    }

    const newStatus = course.status === 'DRAFT' || course.status === 'PAUSED'
      ? 'ACTIVE'
      : course.status;

    await this.prisma.course.update({
      where: { id },
      data: { isPublished: true, status: newStatus },
    });
    return { isPublished: true, status: newStatus };
  }

  async duplicate(id: string): Promise<AdminCourseDetailDto> {
    const original = await this.prisma.course.findUnique({ where: { id } });
    if (!original) {
      throw new NotFoundException('Course not found');
    }

    const slug = await this.ensureUniqueSlug(
      this.generateSlug(`${original.title} Kopie`),
    );

    const copy = await this.prisma.course.create({
      data: {
        title: `${original.title} (Kopie)`,
        slug,
        shortDescription: original.shortDescription,
        description: original.description,
        danceStyle: original.danceStyle,
        targetGroup: original.targetGroup,
        level: original.level,
        duration: original.duration,
        maxParticipants: original.maxParticipants,
        priceInCents: original.priceInCents,
        bookingMode: original.bookingMode,
        catchPhrase: original.catchPhrase,
        imageUrl: original.imageUrl,
        isFree: original.isFree,
        visibility: original.visibility,
        isMarkedAsHighlighted: false,
        instructorId: original.instructorId,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        cancellationPolicyId: original.cancellationPolicyId,
        detailContent: original.detailContent
          ? (original.detailContent as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: 'DRAFT',
        isPublished: false,
      },
    });

    return this.findById(copy.id);
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private buildWhereClause(query: AdminCourseQueryDto): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.danceStyle) {
      where.danceStyle = query.danceStyle;
    }
    if (query.status) {
      where.status = query.status;
    }

    return where;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  private async ensureUniqueSlug(
    slug: string,
    excludeId?: string,
  ): Promise<string> {
    let candidate = slug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.course.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      candidate = `${slug}-${counter}`;
      counter++;
    }
  }

  private async resolveInstructorId(
    providedId: string | undefined,
    adminUserId: string,
  ): Promise<string> {
    if (providedId) {
      const instructor = await this.prisma.instructor.findUnique({
        where: { id: providedId },
      });
      if (!instructor) {
        throw new BadRequestException('Instructor not found');
      }
      return providedId;
    }

    const instructor = await this.prisma.instructor.findUnique({
      where: { userId: adminUserId },
    });

    if (instructor) {
      return instructor.id;
    }

    const firstInstructor = await this.prisma.instructor.findFirst();
    if (!firstInstructor) {
      throw new BadRequestException(
        'No instructor found. Please create an instructor first.',
      );
    }
    return firstInstructor.id;
  }

  private transformToListItem(course: any): AdminCourseListItemDto {
    const priceInEuros = course.priceInCents / 100;
    const priceFormatted =
      priceInEuros === 0
        ? course.isFree
          ? 'Kostenlos'
          : 'Auf Anfrage'
        : `${priceInEuros.toFixed(2).replace('.', ',')} €`;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      danceStyle: course.danceStyle,
      status: course.status,
      visibility: course.visibility,
      isPublished: course.isPublished,
      level: course.level,
      priceInCents: course.priceInCents,
      priceFormatted,
      maxParticipants: course.maxParticipants,
      instructorName: `${course.instructor.user.firstName} ${course.instructor.user.lastName}`,
      totalSessions: course._count.sessions,
      upcomingSessions: course.sessions?.length ?? 0,
      totalBookings: course._count.bookings,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  private transformToDetail(course: any): AdminCourseDetailDto {
    const activeBookingsCount = course.sessions?.reduce(
      (sum: number, s: any) => sum + (s._count?.bookings ?? 0),
      0,
    ) ?? 0;

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
      priceInCents: course.priceInCents,
      priceInEuros: course.priceInCents / 100,
      imageUrl: course.imageUrl ?? undefined,
      bookingMode: course.bookingMode,
      isFree: course.isFree,
      isPublished: course.isPublished,
      isMarkedAsHighlighted: course.isMarkedAsHighlighted,
      status: course.status,
      visibility: course.visibility,
      detailContent: (course.detailContent as Record<string, unknown>) ?? undefined,
      metaTitle: course.metaTitle ?? undefined,
      metaDescription: course.metaDescription ?? undefined,
      ogImageUrl: course.ogImageUrl ?? undefined,
      cancellationPolicyId: course.cancellationPolicyId ?? undefined,
      instructorId: course.instructorId,
      instructor: {
        id: course.instructor.id,
        firstName: course.instructor.user.firstName,
        lastName: course.instructor.user.lastName,
      },
      sessions: (course.sessions ?? []).map((s: any) => this.transformSession(s, course.maxParticipants)),
      totalBookings: course._count?.bookings ?? 0,
      activeBookings: activeBookingsCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  private transformSession(session: any, maxParticipants: number): AdminSessionDto {
    const bookedCount = session._count?.bookings ?? 0;

    return {
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      locationId: session.location?.id ?? session.locationId,
      locationName: session.location?.name ?? '',
      bookedCount,
      maxParticipants,
      waitlistCount: 0,
    };
  }
}
