import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DashboardResponseDto,
  DashboardStatsDto,
  SessionSummaryDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      upcomingSessions,
      pendingBookings,
      waitlistEntries,
      unpaidBookings,
      stats,
    ] = await Promise.all([
      this.getUpcomingSessions(now, weekFromNow),
      this.countPendingBookings(),
      this.countWaitlistEntries(),
      this.countUnpaidBookings(),
      this.getStats(startOfWeek, endOfWeek, startOfMonth, endOfMonth),
    ]);

    const emptySessions = upcomingSessions.filter(
      (s) => s.bookedCount === 0,
    );

    return {
      upcomingSessions,
      pendingBookings,
      waitlistEntries,
      emptySessions,
      unpaidBookings,
      stats,
    };
  }

  private async getUpcomingSessions(
    from: Date,
    to: Date,
  ): Promise<SessionSummaryDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        startTime: { gte: from, lte: to },
        status: 'SCHEDULED',
      },
      include: {
        course: {
          select: {
            title: true,
            danceStyle: true,
            maxParticipants: true,
          },
        },
        location: {
          select: { name: true },
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
          select: { id: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return sessions.map((session) => {
      const bookedCount = session.bookings.length;
      const maxParticipants = session.course.maxParticipants;

      return {
        id: session.id,
        courseTitle: session.course.title,
        danceStyle: session.course.danceStyle,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        locationName: session.location.name,
        bookedCount,
        maxParticipants,
        occupancy:
          maxParticipants > 0
            ? Math.round((bookedCount / maxParticipants) * 100)
            : 0,
      };
    });
  }

  private async countPendingBookings(): Promise<number> {
    return this.prisma.booking.count({
      where: { status: 'PENDING' },
    });
  }

  private async countWaitlistEntries(): Promise<number> {
    return this.prisma.booking.count({
      where: { status: 'WAITLISTED' },
    });
  }

  private async countUnpaidBookings(): Promise<number> {
    return this.prisma.booking.count({
      where: {
        status: { in: ['CONFIRMED', 'PENDING'] },
        payment: {
          status: { in: ['PENDING', 'FAILED'] },
        },
      },
    });
  }

  private async getStats(
    startOfWeek: Date,
    endOfWeek: Date,
    startOfMonth: Date,
    endOfMonth: Date,
  ): Promise<DashboardStatsDto> {
    const [bookingsThisWeek, revenueResult, activeCustomers] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            status: { not: 'CANCELLED' },
          },
        }),

        this.prisma.payment.aggregate({
          where: {
            status: 'PAID',
            paidAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amountInCents: true },
        }),

        this.prisma.user.count({
          where: {
            role: 'CUSTOMER',
            isActive: true,
            bookings: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        }),
      ]);

    const upcomingSessions = await this.prisma.session.findMany({
      where: {
        startTime: { gte: new Date() },
        status: 'SCHEDULED',
      },
      include: {
        course: { select: { maxParticipants: true } },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
          select: { id: true },
        },
      },
    });

    const averageOccupancy =
      upcomingSessions.length > 0
        ? Math.round(
            upcomingSessions.reduce((acc, s) => {
              const max = s.course.maxParticipants;
              return acc + (max > 0 ? (s.bookings.length / max) * 100 : 0);
            }, 0) / upcomingSessions.length,
          )
        : 0;

    return {
      bookingsThisWeek,
      revenueThisMonth: revenueResult._sum.amountInCents ?? 0,
      averageOccupancy,
      activeCustomers,
    };
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}
