import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FinanceSummaryDto,
  FinancePaymentDto,
  FinancePaymentListResponseDto,
  MonthlyRevenueStatDto,
} from './dto/finance-response.dto';
import { FinancePaymentsQueryDto, MonthlyStatsQueryDto } from './dto/finance-query.dto';

@Injectable()
export class AdminFinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<FinanceSummaryDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [monthlyPaid, allTimePaid, pending, refunded] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, paidAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amountInCents: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amountInCents: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amountInCents: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: { in: [PaymentStatus.REFUNDED, PaymentStatus.PARTIAL_REFUND] } },
        _sum: { refundedAmount: true },
      }),
    ]);

    return {
      revenueThisMonth: monthlyPaid._sum.amountInCents ?? 0,
      pendingAmount: pending._sum.amountInCents ?? 0,
      refundedAmount: refunded._sum.refundedAmount ?? 0,
      totalRevenue: allTimePaid._sum.amountInCents ?? 0,
    };
  }

  async getPayments(query: FinancePaymentsQueryDto): Promise<FinancePaymentListResponseDto> {
    const { page = 1, limit = 20, status, from, to } = query;
    const skip = (page - 1) * limit;

    const where = this.buildPaymentsWhere(status, from, to);

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
              course: { select: { title: true } },
              session: { select: { startTime: true } },
            },
          },
        },
      }),
    ]);

    const data: FinancePaymentDto[] = payments.map((p) => ({
      id: p.id,
      amountInCents: p.amountInCents,
      status: p.status,
      method: p.method,
      user: p.booking.user
        ? {
            name: `${p.booking.user.firstName} ${p.booking.user.lastName}`,
            email: p.booking.user.email,
          }
        : null,
      guestEmail: p.booking.guestEmail,
      course: { title: p.booking.course.title },
      session: p.booking.session ? { startTime: p.booking.session.startTime } : null,
      paidAt: p.paidAt,
      refundedAt: p.refundedAt,
      createdAt: p.createdAt,
    }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMonthlyStats(query: MonthlyStatsQueryDto): Promise<MonthlyRevenueStatDto[]> {
    const months = query.months ?? 12;
    const results: MonthlyRevenueStatDto[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const agg = await this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, paidAt: { gte: start, lte: end } },
        _sum: { amountInCents: true },
        _count: { id: true },
      });

      const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      results.push({
        month: monthLabel,
        revenue: agg._sum.amountInCents ?? 0,
        count: agg._count.id ?? 0,
      });
    }

    return results;
  }

  async exportCsv(from?: string, to?: string): Promise<string> {
    const where = this.buildPaymentsWhere(undefined, from, to);

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      include: {
        booking: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            course: { select: { title: true } },
            session: { select: { startTime: true } },
          },
        },
      },
    });

    const header = 'ID;Datum;Teilnehmer;E-Mail;Kurs;Betrag (EUR);Status;Zahlungsmethode';
    const rows = payments.map((p) => {
      const participant = p.booking.user
        ? `${p.booking.user.firstName} ${p.booking.user.lastName}`
        : (p.booking.guestFirstName ? `${p.booking.guestFirstName} ${p.booking.guestLastName ?? ''}`.trim() : 'Gast');
      const email = p.booking.user?.email ?? p.booking.guestEmail ?? '';
      const amountEur = (p.amountInCents / 100).toFixed(2).replace('.', ',');
      const dateStr = p.paidAt ? this.formatDate(p.paidAt) : this.formatDate(p.createdAt);
      const method = p.method ?? '';
      return [p.id, dateStr, participant, email, p.booking.course.title, amountEur, p.status, method].join(';');
    });

    return [header, ...rows].join('\n');
  }

  private buildPaymentsWhere(status?: PaymentStatus, from?: string, to?: string) {
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    if (from || to) {
      where['createdAt'] = {};
      if (from) (where['createdAt'] as Record<string, Date>)['gte'] = new Date(from);
      if (to) (where['createdAt'] as Record<string, Date>)['lte'] = new Date(to + 'T23:59:59.999Z');
    }
    return where;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
