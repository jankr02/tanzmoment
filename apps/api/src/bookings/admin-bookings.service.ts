import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminBookingsService {
  private readonly logger = new Logger(AdminBookingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    courseId?: string;
    page: number;
    limit: number;
  }) {
    const { status, courseId, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where['status'] = status.toUpperCase();
    if (courseId) where['courseId'] = courseId;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              danceStyle: true,
            },
          },
          session: {
            select: { id: true, startTime: true, location: true },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amountInCents: true,
              method: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        isGuestBooking: !b.userId,
        user: b.user
          ? {
              email: b.user.email,
              name: `${b.user.firstName} ${b.user.lastName}`,
            }
          : null,
        guestEmail: b.guestEmail,
        guestName: b.guestFirstName
          ? `${b.guestFirstName} ${b.guestLastName ?? ''}`.trim()
          : null,
        course: b.course,
        session: b.session
          ? {
              id: b.session.id,
              startTime: b.session.startTime,
              location: b.session.location,
            }
          : null,
        payment: b.payment,
        waitlistPosition: b.waitlistPosition,
        createdAt: b.createdAt,
        cancelledAt: b.cancelledAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const statuses = [
      'PENDING',
      'CONFIRMED',
      'CANCELLED',
      'WAITLISTED',
      'COMPLETED',
      'REJECTED',
      'NO_SHOW',
      'ATTENDED',
    ];

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status: status.toLowerCase(),
        count: await this.prisma.booking.count({
          where: { status: status as BookingStatus },
        }),
      })),
    );

    const total = counts.reduce((sum, c) => sum + c.count, 0);

    return { total, byStatus: counts };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            danceStyle: true,
            priceInCents: true,
            maxParticipants: true,
            cancellationPolicy: true,
          },
        },
        session: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async updateStatus(id: string, newStatus: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    const allowed = this.getAllowedAdminTransitions(booking.status);
    const normalizedStatus = newStatus.toUpperCase();

    if (!allowed.includes(normalizedStatus)) {
      throw new BadRequestException(
        `Transition from ${booking.status} to ${normalizedStatus} not allowed. ` +
          `Allowed: ${allowed.join(', ')}`,
      );
    }

    const data: Record<string, unknown> = { status: normalizedStatus };

    if (normalizedStatus === 'CANCELLED') {
      data['cancellationReason'] = reason ?? 'STUDIO_CANCELLED';
      data['cancelledAt'] = new Date();
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data,
    });

    this.logger.log(`Admin status update: booking ${id} → ${normalizedStatus}`);
    return updated;
  }

  /**
   * Admin has broader transition options than regular users.
   */
  private getAllowedAdminTransitions(current: string): string[] {
    const transitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED', 'REJECTED', 'WAITLISTED'],
      CONFIRMED: ['CANCELLED', 'COMPLETED', 'NO_SHOW', 'ATTENDED'],
      WAITLISTED: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      CANCELLED: [],
      COMPLETED: [],
      REJECTED: [],
      NO_SHOW: [],
      ATTENDED: ['COMPLETED'],
    };

    return transitions[current] ?? [];
  }
}
