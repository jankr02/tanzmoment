import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBatchCancelDto } from './dto/admin-batch-cancel.dto';
import { AdminBatchCancelResponse } from '@tanzmoment/shared/types';
import { QUEUE_NAMES } from '../queue';
import { BatchRefundJobData } from '../queue/queue.types';

@Injectable()
export class AdminBookingsService {
  private readonly logger = new Logger(AdminBookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.BATCH_REFUND)
    private readonly batchRefundQueue: Queue<BatchRefundJobData>,
  ) {}

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

  // ===========================================================================
  // BATCH CANCEL – SESSION
  // ===========================================================================

  /**
   * Cancels an entire session: marks it CANCELLED, batch-cancels all active
   * bookings, and enqueues refund jobs for paid bookings.
   */
  async cancelSession(
    sessionId: string,
    adminId: string,
    dto: AdminBatchCancelDto,
  ): Promise<AdminBatchCancelResponse> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        bookings: {
          where: { status: { in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] } },
          include: { payment: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.status === 'CANCELLED') {
      throw new BadRequestException('Session is already cancelled');
    }

    const activeBookings = session.bookings;

    await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionId },
        data: { status: 'CANCELLED' },
      });

      await tx.booking.updateMany({
        where: {
          sessionId,
          status: { in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] },
        },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'STUDIO_CANCELLED',
          cancelledBy: 'ADMIN',
          cancelledByAdminId: adminId,
          cancelledAt: new Date(),
        },
      });
    });

    let refundsQueued = 0;
    let refundJobId: string | undefined;

    const bookingsWithPayments = activeBookings.filter(
      (b) => b.payment?.status === 'PAID',
    );

    if (dto.processRefunds !== false && bookingsWithPayments.length > 0) {
      const job = await this.batchRefundQueue.add(
        'process-batch-refund',
        {
          type: 'SESSION_CANCEL',
          sessionId,
          adminId,
          reason: dto.reason,
          bookingIds: bookingsWithPayments.map((b) => b.id),
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
      refundJobId = job.id as string;
      refundsQueued = bookingsWithPayments.length;
    }

    this.logger.log(
      `Session ${sessionId} cancelled by admin ${adminId}: ` +
        `${activeBookings.length} bookings cancelled, ${refundsQueued} refunds queued`,
    );

    return {
      cancelledCount: activeBookings.length,
      refundsQueued,
      refundJobId,
      skippedCount: 0,
      affectedSessions: [sessionId],
    };
  }

  // ===========================================================================
  // BATCH CANCEL – COURSE
  // ===========================================================================

  /**
   * Cancels an entire course: marks it CANCELLED, cancels all future sessions
   * and their active bookings, and enqueues a batch-refund job.
   */
  async cancelCourse(
    courseId: string,
    adminId: string,
    dto: AdminBatchCancelDto,
  ): Promise<AdminBatchCancelResponse> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sessions: {
          where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          include: {
            bookings: {
              where: { status: { in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] } },
              include: { payment: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    if (course.status === 'CANCELLED') {
      throw new BadRequestException('Course is already cancelled');
    }

    const activeSessions = course.sessions;
    const allBookings = activeSessions.flatMap((s) => s.bookings);
    const sessionIds = activeSessions.map((s) => s.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: courseId },
        data: { status: 'CANCELLED' },
      });

      if (sessionIds.length > 0) {
        await tx.session.updateMany({
          where: { courseId, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          data: { status: 'CANCELLED' },
        });

        await tx.booking.updateMany({
          where: {
            sessionId: { in: sessionIds },
            status: { in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] },
          },
          data: {
            status: 'CANCELLED',
            cancellationReason: 'COURSE_CANCELLED',
            cancelledBy: 'ADMIN',
            cancelledByAdminId: adminId,
            cancelledAt: new Date(),
          },
        });
      }
    });

    let refundsQueued = 0;
    let refundJobId: string | undefined;

    const bookingsWithPayments = allBookings.filter(
      (b) => b.payment?.status === 'PAID',
    );

    if (dto.processRefunds !== false && bookingsWithPayments.length > 0) {
      const job = await this.batchRefundQueue.add(
        'process-batch-refund',
        {
          type: 'COURSE_CANCEL',
          courseId,
          adminId,
          reason: dto.reason,
          bookingIds: bookingsWithPayments.map((b) => b.id),
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
      refundJobId = job.id as string;
      refundsQueued = bookingsWithPayments.length;
    }

    this.logger.log(
      `Course ${courseId} cancelled by admin ${adminId}: ` +
        `${activeSessions.length} sessions, ${allBookings.length} bookings cancelled, ` +
        `${refundsQueued} refunds queued`,
    );

    return {
      cancelledCount: allBookings.length,
      refundsQueued,
      refundJobId,
      skippedCount: 0,
      affectedSessions: sessionIds,
    };
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
