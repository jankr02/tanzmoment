import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES, JOB_NAMES } from '../queue';

@ApiTags('Admin – Payments')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminPaymentsController {
  private readonly logger = new Logger(AdminPaymentsController.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.MAINTENANCE)
    private readonly maintenanceQueue: Queue,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all payments (admin)' })
  async findAll(
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const skip = (+page - 1) * +limit;
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status.toUpperCase();
    if (method) where['method'] = method.toUpperCase();

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              guestEmail: true,
              guestFirstName: true,
              course: { select: { title: true, slug: true } },
            },
          },
          user: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(total / +limit),
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Payment statistics (admin)' })
  async getStats() {
    const [revenue, counts] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amountInCents: true },
        _count: true,
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      totalRevenue: revenue._sum.amountInCents ?? 0,
      totalPaidCount: revenue._count,
      byStatus: counts.map((c) => ({
        status: c.status.toLowerCase(),
        count: c._count,
      })),
    };
  }

  @Get('webhook-events')
  @ApiOperation({ summary: 'List recent webhook events (admin)' })
  async getWebhookEvents(
    @Query('status') status?: string,
    @Query('limit') limit = 50,
  ) {
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status.toUpperCase();

    return this.prisma.webhookEvent.findMany({
      where,
      take: +limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        stripeEventId: true,
        eventType: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiOperation({ summary: 'Get payment details (admin)' })
  async findOne(@Param('id') id: string) {
    return this.prisma.payment.findUniqueOrThrow({
      where: { id },
      include: {
        booking: {
          include: {
            course: { select: { title: true, slug: true, priceInCents: true } },
            session: { select: { startTime: true, location: { select: { name: true } } } },
          },
        },
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });
  }

  @Post('reconcile')
  @ApiOperation({
    summary: 'Trigger manual payment reconciliation',
    description:
      'Checks all PENDING payments against Stripe and fixes discrepancies.',
  })
  async triggerReconciliation(@CurrentUser() admin: { email: string }) {
    this.logger.log(`Manual reconciliation triggered by ${admin.email}`);

    await this.maintenanceQueue.add(JOB_NAMES.RECONCILE_PAYMENTS, {
      triggeredBy: 'manual' as const,
    });

    return { message: 'Reconciliation job queued' };
  }
}
