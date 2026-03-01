import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalendarSessionDto } from './dto/calendar-session.dto';

@Injectable()
export class AdminCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendar(from: Date, to: Date): Promise<CalendarSessionDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        startTime: { gte: from, lte: to },
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

    return sessions.map((session) => ({
      id: session.id,
      courseId: session.courseId,
      courseTitle: session.course.title,
      danceStyle: session.course.danceStyle,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      locationName: session.location.name,
      bookedCount: session.bookings.length,
      maxParticipants: session.course.maxParticipants,
      status: session.status,
    }));
  }
}
