import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { StripeService } from '../payments/stripe.service';
import { RefundService } from '../payments/refund.service';
import {
  QUEUE_NAMES,
  JOB_NAMES,
  TIMING,
  type SessionReminderJobData,
} from '../queue';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import {
  BookingResponseDto,
  CreateBookingResponseDto,
  CancelBookingResponseDto,
  AvailabilityResponseDto,
  PaginatedBookingsResponseDto,
} from './dto/booking-response.dto';
import { CancellationPolicyService } from './cancellation-policy.service';
import { BookingEmailService } from '../email/booking-email.service';
import { RefundType } from '@tanzmoment/shared/types';

type TransactionClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

/**
 * Core booking business logic.
 *
 * Handles booking creation, cancellation, listing, and availability checks.
 * Schedules BullMQ jobs for expiry (PENDING timeout) and session reminders.
 * Integrates with Stripe for paid course checkout and refunds.
 */
@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlistService: WaitlistService,
    private readonly stripeService: StripeService,
    private readonly cancellationPolicyService: CancellationPolicyService,
    private readonly refundService: RefundService,
    private readonly bookingEmailService: BookingEmailService,
    @InjectQueue(QUEUE_NAMES.SESSION_REMINDER)
    private readonly reminderQueue: Queue<SessionReminderJobData>,
  ) {}

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
    const {
      response,
      rawBookingId,
      rawStatus,
      capturedSession,
      isFreeOrNoPrice,
      pendingPaymentId,
      customerEmailForStripe,
      rawCourseTitle,
      rawPriceInCents,
    } = await this.prisma.$transaction(
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

          let session: {
            id: string;
            startTime: Date;
            endTime: Date;
            location: { name: string };
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
                location: { select: { name: true } },
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

          const sessionIdForQuery =
            course.bookingMode === 'SINGLE_SESSION' ? dto.sessionId ?? null : null;

          await this.validateNoDuplicate(
            tx,
            userId,
            dto.guestEmail ?? null,
            dto.courseId,
            sessionIdForQuery,
          );

          const confirmedCount = await this.countActiveBookings(
            tx,
            dto.courseId,
            sessionIdForQuery,
          );

          const isFull = confirmedCount >= course.maxParticipants;

          if (isFull && !userId) {
            throw new BadRequestException(
              'Dieser Kurs ist leider ausgebucht. Erstelle ein Konto, um dich auf die Warteliste setzen zu lassen.',
            );
          }

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
                  location: { select: { name: true } },
                },
              },
            },
          });

          const isFree = course.isFree || course.priceInCents === 0;

          let pendingPaymentId: string | undefined;
          let customerEmailForStripe: string | undefined;
          let paymentInfo:
            | { id: string; amountInCents: number; currency: string; status: string }
            | undefined;

          if (!isFull) {
            if (isFree) {
              await tx.booking.update({
                where: { id: booking.id },
                data: { status: 'CONFIRMED' },
              });

              const freePayment = await tx.payment.create({
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
              paymentInfo = {
                id: freePayment.id,
                amountInCents: 0,
                currency: 'EUR',
                status: 'paid',
              };
            } else {
              // Paid course: create PENDING payment; Stripe session is created after
              // the transaction to avoid holding a serializable lock during external API calls.
              const customerEmail = userId
                ? (
                    await tx.user.findUnique({
                      where: { id: userId },
                      select: { email: true },
                    })
                  )?.email
                : dto.guestEmail;

              const pendingPayment = await tx.payment.create({
                data: {
                  bookingId: booking.id,
                  userId,
                  amountInCents: course.priceInCents,
                  currency: 'EUR',
                  status: 'PENDING',
                },
              });

              pendingPaymentId = pendingPayment.id;
              customerEmailForStripe = customerEmail ?? undefined;
              paymentInfo = {
                id: pendingPayment.id,
                amountInCents: course.priceInCents,
                currency: 'EUR',
                status: 'pending',
              };
            }
          }

          this.logger.log(
            `Booking created: ${booking.id} (status: ${booking.status}, ` +
              `course: ${course.title}, guest: ${!userId})`,
          );

          return {
            response: {
              booking: this.mapToResponseDto(booking),
              checkoutUrl: null,
              payment: booking.status !== 'WAITLISTED' ? paymentInfo : undefined,
            },
            rawBookingId: booking.id,
            rawStatus: booking.status,
            capturedSession: session,
            isFreeOrNoPrice: isFree,
            pendingPaymentId,
            customerEmailForStripe,
            rawCourseTitle: course.title,
            rawPriceInCents: course.priceInCents,
          };
        },
        {
          // Serializable isolation prevents two users from booking the last spot
          isolationLevel: 'Serializable',
          timeout: 10000,
        },
      );

    if (rawStatus === 'PENDING' && !isFreeOrNoPrice) {
      // Paid course: create Stripe Checkout Session outside the transaction
      // to avoid holding a serializable lock during an external API call.
      try {
        const checkoutResult = await this.stripeService.createCheckoutSession({
          bookingId: rawBookingId,
          courseTitle: rawCourseTitle,
          amountInCents: rawPriceInCents,
          currency: 'EUR',
          customerEmail: customerEmailForStripe,
        });

        response.checkoutUrl = checkoutResult.checkoutUrl;

        await this.prisma.payment.update({
          where: { id: pendingPaymentId! },
          data: {
            stripePaymentId: checkoutResult.sessionId,
            stripeStatus: 'open',
          },
        });

        // Schedule expiry job (30 min, synchronized with Stripe checkout expiry)
        this.waitlistService
          .scheduleExpiry(rawBookingId, 'pending_timeout')
          .catch((err) =>
            this.logger.error(`Failed to schedule expiry for ${rawBookingId}`, err),
          );
      } catch (err) {
        if (err instanceof BadRequestException) throw err;

        this.logger.error(`Stripe checkout creation failed for booking ${rawBookingId}: ${err}`);

        await this.prisma.$transaction([
          this.prisma.booking.update({
            where: { id: rawBookingId },
            data: {
              status: 'CANCELLED',
              cancellationReason: 'PAYMENT_FAILED',
              cancelledAt: new Date(),
            },
          }),
          this.prisma.payment.update({
            where: { id: pendingPaymentId! },
            data: { status: 'FAILED' },
          }),
        ]);

        throw new BadRequestException(
          'Zahlungsvorgang konnte nicht gestartet werden. Bitte versuche es erneut.',
        );
      }
    }

    if (rawStatus === 'CONFIRMED' && capturedSession) {
      const delay = Math.max(
        0,
        capturedSession.startTime.getTime() - TIMING.REMINDER_BEFORE_MS - Date.now(),
      );

      if (delay > 0) {
        this.reminderQueue
          .add(
            JOB_NAMES.SEND_REMINDER,
            {
              bookingId: rawBookingId,
              sessionId: capturedSession.id,
              userId,
              guestEmail: dto.guestEmail ?? null,
            },
            { delay, jobId: `reminder-${rawBookingId}` },
          )
          .catch((err) =>
            this.logger.error(
              `Failed to schedule reminder for ${rawBookingId}`,
              err,
            ),
          );
      }

      // Send booking confirmation email for registered users
      if (userId) {
        this.bookingEmailService
          .sendBookingConfirmation(rawBookingId)
          .catch((err) =>
            this.logger.error(`Failed to send confirmation email for ${rawBookingId}`, err),
          );
      }
    }

    if (rawStatus === 'WAITLISTED' && userId) {
      const waitlistPosition = response.booking.waitlistPosition ?? 1;
      this.bookingEmailService
        .sendWaitlistJoined(rawBookingId, waitlistPosition)
        .catch((err) =>
          this.logger.error(`Failed to send waitlist email for ${rawBookingId}`, err),
        );
    }

    return response;
  }

  // ===========================================================================
  // CANCEL BOOKING
  // ===========================================================================

  /**
   * Cancel a booking by the owner (authenticated) or via cancellation token (guest).
   *
   * Uses CancellationPolicyService for refund calculation (DB-backed policy
   * with automatic fallback to default). RefundService handles Stripe + DB tracking.
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
            priceInCents: true,
            isFree: true,
          },
        },
        session: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            location: { select: { name: true } },
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

    // Calculate refund using DB-backed policy
    const policy = await this.cancellationPolicyService.getPolicyForCourse(
      booking.courseId,
    );

    let refundPercentage = 100;
    let refundAmountInCents = 0;

    if (booking.payment) {
      const referenceDate = booking.session?.startTime;
      const refundCalc = referenceDate
        ? this.cancellationPolicyService.calculateRefund(
            policy,
            referenceDate,
            booking.payment.amountInCents,
          )
        : this.cancellationPolicyService.calculateAdminRefund(
            booking.payment.amountInCents,
          );

      refundPercentage = refundCalc.refundPercent;
      refundAmountInCents = refundCalc.refundAmountInCents;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'USER_REQUEST',
          cancelledBy: 'USER',
          cancelledAt: new Date(),
        },
      });

      // Reorder waitlist positions when a waitlisted booking is cancelled
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

    // Initiate Stripe refund if the booking was paid and a refund is due
    if (booking.payment?.status === 'PAID' && refundAmountInCents > 0) {
      const refundCalc = booking.session?.startTime
        ? this.cancellationPolicyService.calculateRefund(
            policy,
            booking.session.startTime,
            booking.payment.amountInCents,
          )
        : this.cancellationPolicyService.calculateAdminRefund(
            booking.payment.amountInCents,
          );

      if (refundCalc.type !== RefundType.NONE) {
        this.refundService
          .processRefund(bookingId, refundCalc, 'User-initiated cancellation')
          .catch((err) =>
            this.logger.error(
              `Refund failed for booking ${bookingId}: ${err}`,
            ),
          );
      }
    }

    // Send cancellation email for registered users
    if (userId) {
      const refundCalcForEmail = booking.payment && booking.session?.startTime
        ? this.cancellationPolicyService.calculateRefund(
            policy,
            booking.session.startTime,
            booking.payment.amountInCents,
          )
        : null;

      this.bookingEmailService
        .sendBookingCancelled(bookingId, refundCalcForEmail
          ? {
              type: refundCalcForEmail.type,
              amountInCents: refundCalcForEmail.refundAmountInCents,
              percent: refundCalcForEmail.refundPercent,
              policyHours: policy.partialRefundHours || policy.fullRefundHours,
            }
          : undefined)
        .catch((err) =>
          this.logger.error(`Failed to send cancellation email for ${bookingId}`, err),
        );
    }

    // Promote the next person on the waitlist if a real spot was freed
    await this.waitlistService
      .triggerPromotion(booking.courseId, booking.sessionId)
      .catch((err) =>
        this.logger.error(`Failed to trigger promotion after cancel ${bookingId}`, err),
      );

    // Remove any pending expiry job (relevant when cancelling a PENDING booking)
    await this.waitlistService
      .cancelExpiry(bookingId)
      .catch((err) =>
        this.logger.error(`Failed to cancel expiry job for ${bookingId}`, err),
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
            location: { select: { name: true } },
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
              location: { select: { name: true } },
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
            location: { select: { name: true } },
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
      location: { name: string };
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
            location: booking.session.location.name,
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
