/**
 * Courses Controller
 *
 * REST API endpoints for course operations.
 * All endpoints are public (no auth required for reading).
 */

import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import {
  CourseListItemDto,
  PaginatedCoursesResponseDto,
} from './dto/course-response.dto';
import { CourseDetailResponseDto } from './dto/course-detail-response.dto';
import { SessionAvailabilityDto } from './dto/session-availability.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CalendarSessionDto } from './dto/calendar-session.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ===========================================================================
  // GET /api/courses - List all courses with filters
  // ===========================================================================

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of courses',
    description: `
      Returns a paginated list of published courses with optional filtering.
      
      **Filters:**
      - \`danceStyle\`: Filter by dance style (accessible, expressive, kids, mothers)
      - \`location\`: Filter by session location (moessingen, bodelshausen)
      - \`dateFrom\`: Filter sessions starting from this date
      - \`dateTo\`: Filter sessions until this date
      - \`highlighted\`: Only return featured courses
      
      **Pagination:**
      - \`page\`: Page number (default: 1)
      - \`limit\`: Items per page (default: 5, max: 50)
      
      **Sorting:**
      - Highlighted courses appear first
      - Then sorted by creation date (newest first)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of courses',
    type: PaginatedCoursesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async findAll(
    @Query() query: CourseQueryDto
  ): Promise<PaginatedCoursesResponseDto> {
    return this.coursesService.findAll(query);
  }

  // ===========================================================================
  // GET /api/courses/highlighted - Get featured courses
  // ===========================================================================

  @Get('highlighted')
  @ApiOperation({
    summary: 'Get highlighted/featured courses',
    description: `
      Returns courses that are marked as highlighted.
      Useful for the "Empfehlungen für Dich" section on the course overview page.
    `,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of courses to return (default: 3)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of highlighted courses',
    type: [CourseListItemDto],
  })
  async findHighlighted(
    @Query('limit') limit?: number
  ): Promise<CourseListItemDto[]> {
    return this.coursesService.findHighlighted(limit ?? 3);
  }

  // ===========================================================================
  // GET /api/courses/sessions - Calendar sessions across all courses
  // ===========================================================================

  @Get('sessions')
  @ApiOperation({
    summary: 'Get scheduled sessions across all courses for the calendar',
    description: `
      Returns all scheduled sessions of published courses within a date range,
      enriched with course metadata and real-time availability.

      Powers the public course-schedule calendar page (/kursplan).

      **Query:**
      - \`dateFrom\` / \`dateTo\`: ISO 8601 range (defaults to next 6 weeks)
      - \`danceStyle\`: optional pre-filter (accessible, expressive, kids, mothers)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Array of calendar sessions sorted chronologically',
    type: [CalendarSessionDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getCalendarSessions(
    @Query() query: CalendarQueryDto,
  ): Promise<CalendarSessionDto[]> {
    return this.coursesService.getCalendarSessions(query);
  }

  // ===========================================================================
  // GET /api/courses/:courseId/sessions - Get sessions with availability
  // ===========================================================================

  @Get(':courseId/sessions')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all sessions for a course with availability information',
    description: `
      Returns all upcoming scheduled sessions for a course with real-time availability data.

      **Returned data:**
      - Available spots per session
      - Waitlist count
      - Whether the current user has already booked (if authenticated)

      **Authentication:**
      - Optional: Works for both authenticated and guest users
      - When authenticated, \`userHasBooking\` reflects the current user's booking status
      - When not authenticated, \`userHasBooking\` is always false
    `,
  })
  @ApiParam({
    name: 'courseId',
    description: 'Course ID',
    example: 'cm1234567890',
  })
  @ApiQuery({
    name: 'includeAvailability',
    required: false,
    type: Boolean,
    description: 'Include availability data (ignored, always included)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status (ignored, only SCHEDULED sessions returned)',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of sessions with availability data',
    type: [SessionAvailabilityDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async getSessionsWithAvailability(
    @Param('courseId') courseId: string,
    @Req() req: { user?: { id: string } },
  ): Promise<SessionAvailabilityDto[]> {
    const userId = req.user?.id;
    return this.coursesService.getSessionsWithAvailability(courseId, userId);
  }

  // ===========================================================================
  // GET /api/courses/:slug - Get single course by slug
  // ===========================================================================

  @Get(':slug')
  @ApiOperation({
    summary: 'Get course details by slug',
    description: `
      Returns detailed information about a single course including:
      - Full course data with CMS-managed detailContent
      - Instructor profile with bio and expertise
      - All upcoming sessions with real-time availability
      - Computed fields (availableSpots, isFullyBooked)
      - SEO metadata
    `,
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly course identifier',
    example: 'ausdruckstanz-frei-verbunden',
  })
  @ApiResponse({
    status: 200,
    description: 'Course details with full data',
    type: CourseDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async findBySlug(
    @Param('slug') slug: string
  ): Promise<CourseDetailResponseDto> {
    const course = await this.coursesService.findBySlug(slug);

    if (!course) {
      throw new NotFoundException(`Course with slug "${slug}" not found`);
    }

    return course;
  }
}
