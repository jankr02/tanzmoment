import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateSessionSeriesDto } from './dto/create-session-series.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionParticipantDto } from './dto/session-participant.dto';
import { AdminSessionDto } from '../courses/dto/admin-course-response.dto';

@Injectable()
export class AdminSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto): Promise<AdminSessionDto> {
    await this.validateCourseExists(dto.courseId);
    await this.validateLocationExists(dto.locationId);
    this.validateSessionTiming(dto.startTime, dto.endTime);

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { maxParticipants: true },
    });

    const session = await this.prisma.session.create({
      data: {
        courseId: dto.courseId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        locationId: dto.locationId,
        status: 'SCHEDULED',
      },
      include: {
        location: { select: { id: true, name: true } },
      },
    });

    return {
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      locationId: session.location.id,
      locationName: session.location.name,
      bookedCount: 0,
      maxParticipants: course!.maxParticipants,
      waitlistCount: 0,
    };
  }

  async createSeries(
    dto: CreateSessionSeriesDto,
  ): Promise<{ created: number; sessions: AdminSessionDto[] }> {
    await this.validateCourseExists(dto.courseId);
    await this.validateLocationExists(dto.locationId);

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { maxParticipants: true },
    });

    const dates = this.generateSeriesDates(dto);

    if (dates.length === 0) {
      throw new BadRequestException(
        'No sessions to create. Check the date range and weekday.',
      );
    }

    const [hours, minutes] = dto.startTime.split(':').map(Number);

    const sessionsData = dates.map((date) => {
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + dto.durationMinutes);

      return {
        courseId: dto.courseId,
        startTime,
        endTime,
        locationId: dto.locationId,
        status: 'SCHEDULED' as const,
      };
    });

    await this.prisma.session.createMany({ data: sessionsData });

    const createdSessions = await this.prisma.session.findMany({
      where: {
        courseId: dto.courseId,
        startTime: { in: sessionsData.map((s) => s.startTime) },
        locationId: dto.locationId,
      },
      orderBy: { startTime: 'asc' },
      include: {
        location: { select: { id: true, name: true } },
      },
    });

    return {
      created: createdSessions.length,
      sessions: createdSessions.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        locationId: s.location.id,
        locationName: s.location.name,
        bookedCount: 0,
        maxParticipants: course!.maxParticipants,
        waitlistCount: 0,
      })),
    };
  }

  async update(id: string, dto: UpdateSessionDto): Promise<AdminSessionDto> {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { course: { select: { maxParticipants: true } } },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (dto.locationId) {
      await this.validateLocationExists(dto.locationId);
    }

    const data: Record<string, unknown> = {};
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.locationId !== undefined) data.locationId = dto.locationId;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.session.update({
      where: { id },
      data,
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
    });

    return {
      id: updated.id,
      startTime: updated.startTime,
      endTime: updated.endTime,
      status: updated.status,
      locationId: updated.location.id,
      locationName: updated.location.name,
      bookedCount: updated._count.bookings,
      maxParticipants: session.course.maxParticipants,
      waitlistCount: 0,
    };
  }

  async cancel(id: string): Promise<void> {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getParticipants(sessionId: string): Promise<SessionParticipantDto[]> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const bookings = await this.prisma.booking.findMany({
      where: { sessionId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return bookings.map((b) => {
      const isGuest = !b.userId;
      const name = isGuest
        ? `${b.guestFirstName ?? ''} ${b.guestLastName ?? ''}`.trim()
        : `${b.user!.firstName} ${b.user!.lastName}`;
      const email = isGuest ? b.guestEmail! : b.user!.email;
      const phone = isGuest ? b.guestPhone : b.user!.phone;

      return {
        bookingId: b.id,
        name,
        email,
        phone: phone ?? undefined,
        isGuest,
        bookingStatus: b.status,
        paymentStatus: b.payment?.status ?? undefined,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private generateSeriesDates(dto: CreateSessionSeriesDto): Date[] {
    const start = new Date(dto.seriesStartDate);
    const end = new Date(dto.seriesEndDate);
    const excludeSet = new Set(dto.excludeDates ?? []);
    const dates: Date[] = [];

    const current = new Date(start);

    while (current.getDay() !== dto.weekday) {
      current.setDate(current.getDate() + 1);
    }

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (!excludeSet.has(dateStr)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 7);
    }

    return dates;
  }

  private validateSessionTiming(startTime: string, endTime: string): void {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start.getTime() < Date.now()) {
      throw new BadRequestException(
        'Der Termin liegt in der Vergangenheit. Bitte wähle ein Datum in der Zukunft.',
      );
    }

    if (end.getTime() <= start.getTime()) {
      throw new BadRequestException(
        'Das Ende des Termins muss nach dem Start liegen.',
      );
    }
  }

  private async validateCourseExists(courseId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  }

  private async validateLocationExists(locationId: string): Promise<void> {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true },
    });
    if (!location) {
      throw new BadRequestException('Location not found');
    }
  }
}
