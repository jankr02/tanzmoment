import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { AdminCalendarService } from './admin-calendar.service';
import { CalendarSessionDto } from './dto/calendar-session.dto';

@ApiTags('Admin - Calendar')
@Controller('admin/calendar')
@AdminOnly()
export class AdminCalendarController {
  constructor(private readonly calendarService: AdminCalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get sessions for calendar view' })
  @ApiQuery({ name: 'from', description: 'Start date (YYYY-MM-DD)', required: true })
  @ApiQuery({ name: 'to', description: 'End date (YYYY-MM-DD)', required: true })
  @ApiResponse({ status: 200, type: [CalendarSessionDto] })
  async getCalendar(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<CalendarSessionDto[]> {
    if (!from || !to) {
      throw new BadRequestException('Query params "from" and "to" are required');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.calendarService.getCalendar(fromDate, toDate);
  }
}
