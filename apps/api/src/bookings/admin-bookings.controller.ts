import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminBookingsService } from './admin-bookings.service';
import { AdminBatchCancelDto } from './dto/admin-batch-cancel.dto';

@ApiTags('Admin – Bookings')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminBookingsController {
  private readonly logger = new Logger(AdminBookingsController.name);

  constructor(private readonly adminService: AdminBookingsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all bookings (admin)',
    description:
      'Returns all bookings with optional filters. ' +
      'Includes user/guest info and payment status.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of all bookings' })
  async findAll(
    @Query('status') status?: string,
    @Query('courseId') courseId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.findAll({
      status,
      courseId,
      from,
      to,
      paymentStatus,
      page: +page,
      limit: +limit,
    });
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Booking statistics (admin)',
    description: 'Returns aggregate counts by status.',
  })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOperation({
    summary: 'Get booking details (admin)',
    description: 'Full booking details including user info, payment, course.',
  })
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id/status')
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOperation({
    summary: 'Update booking status (admin)',
    description:
      'Allows admins to manually change booking status. ' +
      'Validates allowed transitions.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') newStatus: string,
    @Body('reason') reason: string | undefined,
    @CurrentUser() admin: { id: string; email: string },
  ) {
    this.logger.log(
      `Admin ${admin.email} updating booking ${id} → ${newStatus}`,
    );
    return this.adminService.updateStatus(id, newStatus, reason);
  }

  @Patch(':id/mark-attended')
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOperation({ summary: 'Mark booking as attended (admin)' })
  async markAttended(@Param('id') id: string) {
    return this.adminService.updateStatus(id, 'ATTENDED', undefined);
  }

  @Patch(':id/mark-no-show')
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOperation({ summary: 'Mark booking as no-show (admin)' })
  async markNoShow(@Param('id') id: string) {
    return this.adminService.updateStatus(id, 'NO_SHOW', undefined);
  }

  // ===========================================================================
  // POST /admin/bookings/sessions/:id/cancel
  // ===========================================================================

  @Post('sessions/:id/cancel')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOperation({
    summary: 'Cancel entire session (admin)',
    description:
      'Cancels a session and all active bookings. ' +
      'Queues batch refunds for paid bookings.',
  })
  @ApiResponse({ status: 201, description: 'Session cancelled with batch details' })
  @ApiResponse({ status: 400, description: 'Session already cancelled' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async cancelSession(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AdminBatchCancelDto,
    @CurrentUser() admin: { id: string; email: string },
  ) {
    this.logger.log(`Admin ${admin.email} cancelling session ${id}`);
    return this.adminService.cancelSession(id, admin.id, dto);
  }

  // ===========================================================================
  // POST /admin/bookings/courses/:id/cancel
  // ===========================================================================

  @Post('courses/:id/cancel')
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({
    summary: 'Cancel entire course (admin)',
    description:
      'Cancels a course and all future sessions with their active bookings. ' +
      'Queues batch refunds for paid bookings.',
  })
  @ApiResponse({ status: 201, description: 'Course cancelled with batch details' })
  @ApiResponse({ status: 400, description: 'Course already cancelled' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async cancelCourse(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AdminBatchCancelDto,
    @CurrentUser() admin: { id: string; email: string },
  ) {
    this.logger.log(`Admin ${admin.email} cancelling course ${id}`);
    return this.adminService.cancelCourse(id, admin.id, dto);
  }
}
