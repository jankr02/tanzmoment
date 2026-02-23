import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import {
  BookingResponseDto,
  CreateBookingResponseDto,
  CancelBookingResponseDto,
  AvailabilityResponseDto,
  PaginatedBookingsResponseDto,
} from './dto/booking-response.dto';
import {
  type CancellationPolicy,
  DEFAULT_CANCELLATION_POLICY,
  resolveRefundPercentage,
} from '@tanzmoment/shared/types';

type TransactionClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

/**
 * Core booking business logic.
 *
 * Phase 2 scope:
 * - Create bookings (authenticated + guest)
 * - Cancel bookings (by owner or via token)
 * - List own bookings (authenticated)
 * - Check availability (public)
 *
 * NOT in scope (later phases):
 * - Stripe payment integration (Phase 4)
 * - Waitlist promotion with payment links (Phase 3/5)
 * - Email notifications (Phase 7)
 */
@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE BOOKING
  // ===========================================================================

  /**
   * Create a new booking for a registered user or guest.
   *
   * Uses Prisma's interactive transaction with Serializable isolation
   * to prevent race conditions on the last available spot.
   */
  async createBooking(
    userId: string | null,
    dto: CreateBookingDto,
  ): Promise<CreateBookingResponseDto> {
    return this.prisma.$transaction(
      async (tx) => {
        const course = await tx.course.findUnique({
          where: { id: dto.courseId },
          select: {
            id: true,
            title: true,
            slug: true,
            danceStyle: true,
            imageUrl: true,
            bookingMode: true,
            maxParticipants: true,
            priceInCents: true,
            isFree: true,
            status: true,
            isPublished: true,
          },
        });

        if (!course) {
          throw new NotFoundException('Kurs nicht gefunden.');
        }

        if (!course.isPublished || course.status !== 'ACTIVE') {
          throw new BadRequestException(
            'Buchungen für diesen Kurs sind derzeit nicht möglich.',
          );
        }

        // Validate session for SINGLE_SESSION mode
        let session: {
          id: string;
          startTime: Date;
          endTime: Date;
          location: string;
          status: string;
        } | null = null;

        if (course.bookingMode === 'SINGLE_SESSION') {
          if (!dto.sessionId) {
            throw new BadRequestException(
              'Für diesen Kurs muss eine Session ausgewählt werden.',
            );
          }

          session = await tx.session.findUnique({
            where: { id: dto.sessionId },
            select: {
              id: true,
              startTime: true,
              endTime: true,
              location: true,
              status: true,
            },
          });

          if (!session) {
            throw new NotFoundException('Termin nicht gefunden.');
          }

          if (session.status === 'CANCELLED') {
            throw new BadRequestException('Dieser Termin wurde abgesagt.');
          }

          if (new Date(session.startTime) < new Date()) {
            throw new BadRequestException(
              'Dieser Termin liegt in der Vergangenheit.',
            );
          }
        }

        // Check for duplicate booking
        const sessionIdForQuery =
          course.bookingMode === 'SINGLE_SESSION' ? dto.sessionId ?? null : null;

        await this.validateNoDuplicate(
          tx,
          userId,
          dto.guestEmail ?? null,
          dto.courseId,
          sessionIdForQuery,
        );

        // Check capacity
        const confirmedCount = await this.countActiveBookings(
          tx,
          dto.courseId,
          sessionIdForQuery,
        );

        const isFull = confirmedCount >= course.maxParticipants;

        // Waitlist requires an account
        if (isFull && !userId) {
          throw new BadRequestException(
            'Dieser Kurs ist leider ausgebucht. Erstelle ein Konto, um dich auf die Warteliste setzen zu lassen.',
          );
        }

        // Create booking record
        const bookingStatus = isFull ? 'WAITLISTED' : 'PENDING';
        const waitlistPosition = isFull
          ? await this.getNextWaitlistPosition(tx, dto.courseId, sessionIdForQuery)
          : null;

        const booking = await tx.booking.create({
          data: {
            userId,
            courseId: dto.courseId,
            sessionId:
              course.bookingMode === 'SINGLE_SESSION' ? dto.sessionId : null,
            status: bookingStatus,
            waitlistPosition,
            notes: dto.notes,
            guestEmail: !userId ? dto.guestEmail : null,
            guestFirstName: !userId ? dto.guestFirstName : null,
            guestLastName: !userId ? dto.guestLastName : null,
            guestPhone: !userId ? dto.guestPhone : null,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                danceStyle: true,
                imageUrl: true,
              },
            },
            session: {
              select: {
                id: true,
                startTime: true,
                endTime: true,
                location: true,
              },
            },
          },
        });

        // For free courses (not on waitlist): confirm immediately
        if (!isFull && (course.isFree || course.priceInCents === 0)) {
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: 'CONFIRMED' },
          });

          await tx.payment.create({
            data: {
              bookingId: booking.id,
              userId,
              amountInCents: 0,
              currency: 'EUR',
              method: 'FREE',
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          booking.status = 'CONFIRMED';
        }

        this.logger.log(
          `Booking created: ${booking.id} (status: ${booking.status}, ` +
            `course: ${course.title}, guest: ${!userId})`,
        );

        const responseBooking = this.mapToResponseDto(booking);

        return {
          booking: responseBooking,
          checkoutUrl: null,
          payment:
            booking.status !== 'WAITLISTED' &&
            (course.isFree || course.priceInCents === 0)
              ? {
                  id: 'free',
                  amountInCents: 0,
                  currency: 'EUR',
                  status: 'paid',
                }
              : undefined,
        };
      },
      {
        // Serializable isolation prevents two users from booking the last spot
        isolationLevel: 'Serializable',
        timeout: 10000,
      },
    );
  }

  // ===========================================================================
  // CANCEL BOOKING
  // ===========================================================================

  /**
   * Cancel a booking by the owner (authenticated) or via cancellation token (guest).
   */
  async cancelBooking(
    bookingId: string,
    userId: string | null,
    cancellationToken: string | null,
  ): Promise<CancelBookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            danceStyle: true,
            imageUrl: true,
            cancellationPolicy: true,
            priceInCents: true,
            isFree: true,
          },
        },
        session: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            location: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Buchung nicht gefunden.');
    }

    this.authorizeCancel(booking, userId, cancellationToken);

    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'WAITLISTED'];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new BadRequestException(
        'Diese Buchung kann nicht mehr storniert werden.',
      );
    }

    const policy: CancellationPolicy =
      (booking.course.cancellationPolicy as unknown as CancellationPolicy) ??
      DEFAULT_CANCELLATION_POLICY;

    if (!policy.allowCancellation) {
      throw new BadRequestException(
        policy.cancellationNote ??
          'Stornierung ist für diesen Kurs nicht möglich.',
      );
    }

    const referenceDate = booking.session?.startTime ?? null;
    let refundPercentage = 100;

    if (referenceDate) {
      const daysUntil = this.calculateDaysUntil(referenceDate);
      refundPercentage = resolveRefundPercentage(policy, daysUntil);
    }

    const refundAmountInCents = booking.payment
      ? Math.round(
          booking.payment.amountInCents * (refundPercentage / 100),
        )
      : 0;

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'USER_REQUEST',
          cancelledAt: new Date(),
        },
      });

      // Update payment status if exists (actual Stripe refund in Phase 6)
      if (
        booking.payment &&
        booking.payment.status === 'PAID' &&
        refundPercentage > 0
      ) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: refundPercentage === 100 ? 'REFUNDED' : 'PARTIAL_REFUND',
            refundedAmount: refundAmountInCents,
            refundedAt: new Date(),
          },
        });
      }

      // If waitlisted booking was cancelled, reorder positions
      if (
        booking.status === 'WAITLISTED' &&
        booking.waitlistPosition != null
      ) {
        await tx.booking.updateMany({
          where: {
            courseId: booking.courseId,
            sessionId: booking.sessionId,
            status: 'WAITLISTED',
            waitlistPosition: { gt: booking.waitlistPosition },
          },
          data: {
            waitlistPosition: { decrement: 1 },
          },
        });
      }
    });

    this.logger.log(
      `Booking cancelled: ${bookingId} (refund: ${refundPercentage}%, ` +
        `amount: ${refundAmountInCents} cents)`,
    );

    const updated = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            danceStyle: true,
            imageUrl: true,
          },
        },
        session: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            location: true,
          },
        },
      },
    });

    return {
      booking: this.mapToResponseDto(updated),
      refundPercentage,
      refundAmountInCents,
    };
  }

  /**
   * Cancel a booking by its cancellation token (guest flow).
   */
  async cancelByToken(token: string): Promise<CancelBookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { cancellationToken: token },
    });

    if (!booking) {
      throw new NotFoundException('Ungültiger Stornierungslink.');
    }

    return this.cancelBooking(booking.id, null, token);
  }

  // ===========================================================================
  // LIST BOOKINGS (authenticated user)
  // ===========================================================================

  async findMyBookings(
    userId: string,
    query: BookingQueryDto,
  ): Promise<PaginatedBookingsResponseDto> {
    const { status, courseId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (status) where['status'] = status.toUpperCase();
    if (courseId) where['courseId'] = courseId;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              danceStyle: true,
              imageUrl: true,
            },
          },
          session: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              location: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings.map((b) => this.mapToResponseDto(b)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  // ===========================================================================
  // GET SINGLE BOOKING
  // ===========================================================================

  async findOne(
    bookingId: string,
    userId: string | null,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            danceStyle: true,
            imageUrl: true,
          },
        },
        session: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            location: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Buchung nicht gefunden.');
    }

    if (userId && booking.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.mapToResponseDto(booking);
  }

  // ===========================================================================
  // AVAILABILITY (public)
  // ===========================================================================

  /**
   * Returns availability info for a course or specific session.
   * This endpoint is public and exposes no personal data.
   */
  async getAvailability(
    courseId: string,
    sessionId?: string,
  ): Promise<AvailabilityResponseDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        bookingMode: true,
        maxParticipants: true,
        status: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs nicht gefunden.');
    }

    if (course.bookingMode === 'SINGLE_SESSION' && !sessionId) {
      throw new BadRequestException(
        'Für Drop-in-Kurse muss eine Session-ID angegeben werden.',
      );
    }

    const activeStatuses: BookingStatus[] = ['CONFIRMED', 'PENDING'];
    const sessionFilter =
      course.bookingMode === 'SINGLE_SESSION' && sessionId
        ? { sessionId }
        : { sessionId: null };

    const confirmedCount = await this.prisma.booking.count({
      where: {
        courseId,
        ...sessionFilter,
        status: { in: activeStatuses },
      },
    });

    const waitlistCount = await this.prisma.booking.count({
      where: {
        courseId,
        ...sessionFilter,
        status: 'WAITLISTED',
      },
    });

    const availableSpots = Math.max(
      0,
      course.maxParticipants - confirmedCount,
    );
    const isCancelled = course.status === 'CANCELLED';

    let status: string;
    if (isCancelled) {
      status = 'cancelled';
    } else if (availableSpots > 3) {
      status = 'available';
    } else if (availableSpots > 0) {
      status = 'few_spots';
    } else if (waitlistCount > 0) {
      status = 'waitlist_available';
    } else {
      status = 'full';
    }

    return {
      courseId,
      sessionId: sessionId ?? undefined,
      maxParticipants: course.maxParticipants,
      confirmedBookings: confirmedCount,
      availableSpots,
      waitlistCount,
      status,
      bookingMode:
        course.bookingMode === 'FULL_COURSE'
          ? 'full_course'
          : 'single_session',
    };
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Checks that no active booking exists for this user/guest + course/session.
   */
  private async validateNoDuplicate(
    tx: TransactionClient,
    userId: string | null,
    guestEmail: string | null,
    courseId: string,
    sessionId: string | null,
  ): Promise<void> {
    const activeStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'WAITLISTED'];

    const existing = await tx.booking.findFirst({
      where: {
        courseId,
        sessionId,
        status: { in: activeStatuses },
        ...(userId ? { userId } : { guestEmail }),
      },
    });

    if (existing) {
      throw new ConflictException(
        'Du hast bereits eine aktive Buchung für diesen Kurs.',
      );
    }
  }

  /**
   * Count active (non-cancelled, non-rejected) bookings for capacity check.
   */
  private async countActiveBookings(
    tx: TransactionClient,
    courseId: string,
    sessionId: string | null,
  ): Promise<number> {
    return tx.booking.count({
      where: {
        courseId,
        sessionId,
        status: { in: ['CONFIRMED', 'PENDING'] as BookingStatus[] },
      },
    });
  }

  /**
   * Get next waitlist position for a course/session.
   */
  private async getNextWaitlistPosition(
    tx: TransactionClient,
    courseId: string,
    sessionId: string | null,
  ): Promise<number> {
    const maxPosition = await tx.booking.aggregate({
      where: {
        courseId,
        sessionId,
        status: 'WAITLISTED',
      },
      _max: { waitlistPosition: true },
    });

    return (maxPosition._max.waitlistPosition ?? 0) + 1;
  }

  /**
   * Authorization check for cancelling a booking.
   */
  private authorizeCancel(
    booking: { userId: string | null; cancellationToken: string | null },
    userId: string | null,
    cancellationToken: string | null,
  ): void {
    if (userId && booking.userId === userId) return;
    if (cancellationToken && booking.cancellationToken === cancellationToken)
      return;

    throw new ForbiddenException(
      'Du bist nicht berechtigt, diese Buchung zu stornieren.',
    );
  }

  private calculateDaysUntil(date: Date): number {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Map a Prisma booking record to the response DTO.
   */
  private mapToResponseDto(booking: {
    id: string;
    userId: string | null;
    status: string;
    guestEmail: string | null;
    guestFirstName: string | null;
    guestLastName: string | null;
    guestPhone: string | null;
    waitlistPosition: number | null;
    cancellationReason: string | null;
    notes: string | null;
    createdAt: Date;
    cancelledAt: Date | null;
    course: {
      id: string;
      title: string;
      slug: string;
      danceStyle: string;
      imageUrl: string | null;
    };
    session: {
      id: string;
      startTime: Date;
      endTime: Date;
      location: string;
    } | null;
  }): BookingResponseDto {
    const isGuest = !booking.userId;

    return {
      id: booking.id,
      status: booking.status.toLowerCase(),
      isGuestBooking: isGuest,
      guestInfo:
        isGuest && booking.guestEmail
          ? {
              email: booking.guestEmail,
              firstName: booking.guestFirstName ?? '',
              lastName: booking.guestLastName ?? undefined,
              phone: booking.guestPhone ?? undefined,
            }
          : undefined,
      course: {
        id: booking.course.id,
        title: booking.course.title,
        slug: booking.course.slug,
        danceStyle: booking.course.danceStyle,
        imageUrl: booking.course.imageUrl ?? undefined,
      },
      session: booking.session
        ? {
            id: booking.session.id,
            startTime: booking.session.startTime.toISOString(),
            endTime: booking.session.endTime.toISOString(),
            location: booking.session.location,
          }
        : undefined,
      waitlistPosition: booking.waitlistPosition ?? undefined,
      notes: booking.notes ?? undefined,
      cancellationReason:
        booking.cancellationReason?.toLowerCase() ?? undefined,
      createdAt: booking.createdAt.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString() ?? undefined,
    };
  }
}
