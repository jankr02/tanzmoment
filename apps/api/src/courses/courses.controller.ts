import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseListItemDto } from './dto/course-list.dto';
import { CourseDetailDto } from './dto/course-detail.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({
    status: 200,
    description: 'List of all published courses with next session info',
    type: [CourseListItemDto],
  })
  findAll(): Promise<CourseListItemDto[]> {
    return this.coursesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get course details by slug' })
  @ApiResponse({
    status: 200,
    description: 'Course details with instructor and upcoming sessions',
    type: CourseDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findBySlug(@Param('slug') slug: string): Promise<CourseDetailDto> {
    return this.coursesService.findBySlug(slug);
  }
}
