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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import {
  CourseListItemDto,
  PaginatedCoursesResponseDto,
} from './dto/course-response.dto';

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
  // GET /api/courses/:slug - Get single course by slug
  // ===========================================================================

  @Get(':slug')
  @ApiOperation({
    summary: 'Get course by slug',
    description: 'Returns detailed information about a single course.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly course identifier',
    example: 'ausdruckstanz-frei-verbunden',
  })
  @ApiResponse({
    status: 200,
    description: 'Course details',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async findBySlug(@Param('slug') slug: string) {
    const course = await this.coursesService.findBySlug(slug);

    if (!course) {
      throw new NotFoundException(`Course with slug "${slug}" not found`);
    }

    return course;
  }
}
