import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { BookingsService } from './bookings.service';
import { ReceiptPdfService } from './receipt-pdf.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import {
  BookingResponseDto,
  CreateBookingResponseDto,
  CancelBookingResponseDto,
  AvailabilityResponseDto,
  PaginatedBookingsResponseDto,
} from './dto/booking-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CancellationPreview } from '@tanzmoment/shared/types';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly receiptPdfService: ReceiptPdfService,
  ) {}

  // ===========================================================================
  // POST /bookings – Create booking (auth optional)
  // ===========================================================================

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new booking',
    description: `
      Creates a booking for a course or session.

      **Authentication:** Optional.
      - Authenticated users: userId extracted from JWT.
      - Guests: Must provide guestEmail and guestFirstName.

      **Booking modes:**
      - FULL_COURSE: sessionId is ignored.
      - SINGLE_SESSION: sessionId is required.

      **Capacity:**
      - If spots are available: Booking is created as PENDING (paid) or CONFIRMED (free).
      - If full: Authenticated users are waitlisted. Guests receive an error.

      **Free courses:** Booking is immediately CONFIRMED with a FREE payment record.
    `,
  })
  @ApiResponse({ status: 201, type: CreateBookingResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Validation error or course not bookable',
  })
  @ApiResponse({ status: 404, description: 'Course or session not found' })
  @ApiResponse({ status: 409, description: 'Duplicate booking' })
  async createBooking(
    @CurrentUser() user: { id: string } | null,
    @Body(ValidationPipe) dto: CreateBookingDto,
  ): Promise<CreateBookingResponseDto> {
    if (!user && (!dto.guestEmail || !dto.guestFirstName)) {
      throw new BadRequestException(
        'Bitte gib mindestens eine E-Mail-Adresse und deinen Vornamen an.',
      );
    }

    return this.bookingsService.createBooking(user?.id ?? null, dto);
  }

  // ===========================================================================
  // GET /bookings – List own bookings (auth required)
  // ===========================================================================

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List own bookings',
    description:
      'Returns paginated list of bookings for the authenticated user.',
  })
  @ApiResponse({ status: 200, type: PaginatedBookingsResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async findMyBookings(
    @CurrentUser() user: { id: string },
    @Query() query: BookingQueryDto,
  ): Promise<PaginatedBookingsResponseDto> {
    return this.bookingsService.findMyBookings(user.id, query);
  }

  // ===========================================================================
  // GET /bookings/availability/:courseId – Public availability check
  // ===========================================================================

  @Get('availability/:courseId')
  @ApiOperation({
    summary: 'Check course/session availability',
    description:
      'Returns capacity info for a course or specific session. ' +
      'No authentication required. No personal data exposed.',
  })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID (required for SINGLE_SESSION courses)',
  })
  @ApiResponse({ status: 200, type: AvailabilityResponseDto })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getAvailability(
    @Param('courseId') courseId: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<AvailabilityResponseDto> {
    return this.bookingsService.getAvailability(courseId, sessionId);
  }

  // ===========================================================================
  // GET /bookings/:id/verify-payment – Public post-checkout verification
  // ===========================================================================

  @Get(':id/verify-payment')
  @ApiOperation({
    summary: 'Verify booking payment status after the Stripe redirect',
    description:
      'Public endpoint called by the success page after returning from Stripe. ' +
      'Requires the Stripe Checkout Session id (session_id) as a capability so a ' +
      'caller cannot read a stranger booking by guessing its id. No contact data is exposed.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiQuery({ name: 'session_id', description: 'Stripe Checkout Session id from the redirect' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found or session_id mismatch' })
  async verifyPayment(
    @Param('id') id: string,
    @Query('session_id') sessionId: string,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.verifyBookingPayment(id, sessionId);
  }

  // ===========================================================================
  // GET /bookings/:id – Get single booking (auth required)
  // ===========================================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a single booking by ID',
    description:
      'Returns booking details. Only accessible by the booking owner.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  @ApiResponse({ status: 403, description: 'Not the booking owner' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(id, user.id);
  }

  // ===========================================================================
  // GET /bookings/:id/cancellation-preview – Refund preview (auth required)
  // ===========================================================================

  @Get(':id/cancellation-preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Preview refund for a booking cancellation',
    description:
      'Returns refund amount and policy explanation without modifying the booking.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Cancellation preview returned' })
  @ApiResponse({ status: 403, description: 'Not the booking owner' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getCancellationPreview(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<CancellationPreview> {
    return this.bookingsService.getCancellationPreview(id, user.id);
  }

  // ===========================================================================
  // PATCH /bookings/:id/cancel – Cancel booking (auth required)
  // ===========================================================================

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel a booking',
    description:
      'Cancels a booking owned by the authenticated user. ' +
      'Refund percentage depends on the course cancellation policy.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, type: CancelBookingResponseDto })
  @ApiResponse({ status: 400, description: 'Booking not cancellable' })
  @ApiResponse({ status: 403, description: 'Not the booking owner' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CancelBookingDto = {},
  ): Promise<CancelBookingResponseDto> {
    return this.bookingsService.cancelBooking(id, user.id, null, dto.reason);
  }

  // ===========================================================================
  // POST /bookings/:id/resume-checkout – Restart Stripe checkout (auth required)
  // ===========================================================================

  @Post(':id/resume-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resume Stripe checkout for a pending booking',
    description:
      'Creates a fresh Stripe Checkout Session for a PENDING booking ' +
      'whose original session expired or was abandoned.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'New checkout URL returned' })
  @ApiResponse({ status: 400, description: 'Booking not eligible for resume' })
  @ApiResponse({ status: 403, description: 'Not the booking owner' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async resumeCheckout(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<{ checkoutUrl: string }> {
    return this.bookingsService.resumeCheckout(id, user.id);
  }

  // ===========================================================================
  // GET /bookings/:id/receipt.pdf – Download payment receipt (auth required)
  // ===========================================================================

  @Get(':id/receipt.pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download a PDF receipt for a paid booking',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'PDF receipt' })
  @ApiResponse({ status: 400, description: 'Receipt not available yet' })
  @ApiResponse({ status: 403, description: 'Not the booking owner' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async downloadReceipt(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ): Promise<void> {
    const { filename, buffer } = await this.receiptPdfService.generateReceipt(
      id,
      user.id,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }

  // ===========================================================================
  // PATCH /bookings/cancel-by-token – Cancel via token (public, for guests)
  // ===========================================================================

  @Patch('cancel-by-token')
  @ApiOperation({
    summary: 'Cancel a booking via cancellation token',
    description:
      'Allows guests to cancel their booking using the token from the confirmation email. ' +
      'No authentication required.',
  })
  @ApiQuery({ name: 'token', description: 'Cancellation token from email' })
  @ApiResponse({ status: 200, type: CancelBookingResponseDto })
  @ApiResponse({ status: 400, description: 'Booking not cancellable' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async cancelByToken(
    @Query('token') token: string,
  ): Promise<CancelBookingResponseDto> {
    if (!token) {
      throw new BadRequestException('Stornierungstoken fehlt.');
    }

    return this.bookingsService.cancelByToken(token);
  }
}
