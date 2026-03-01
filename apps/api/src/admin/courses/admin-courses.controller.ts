import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminCoursesService } from './admin-courses.service';
import { AdminCourseQueryDto } from './dto/admin-course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  AdminCourseDetailDto,
  PaginatedAdminCoursesResponseDto,
} from './dto/admin-course-response.dto';

@ApiTags('Admin - Courses')
@Controller('admin/courses')
@AdminOnly()
export class AdminCoursesController {
  constructor(private readonly coursesService: AdminCoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses (admin view, all statuses)' })
  @ApiResponse({ status: 200, type: PaginatedAdminCoursesResponseDto })
  async findAll(
    @Query() query: AdminCourseQueryDto,
  ): Promise<PaginatedAdminCoursesResponseDto> {
    return this.coursesService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course (defaults to DRAFT)' })
  @ApiResponse({ status: 201, type: AdminCourseDetailDto })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: { id: string },
  ): Promise<AdminCourseDetailDto> {
    return this.coursesService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full course details (admin view)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, type: AdminCourseDetailDto })
  async findById(@Param('id') id: string): Promise<AdminCourseDetailDto> {
    return this.coursesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course fields' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, type: AdminCourseDetailDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<AdminCourseDetailDto> {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a course (soft delete)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 204 })
  async archive(@Param('id') id: string): Promise<void> {
    return this.coursesService.archive(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Toggle course publish/unpublish' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200 })
  async togglePublish(
    @Param('id') id: string,
  ): Promise<{ isPublished: boolean; status: string }> {
    return this.coursesService.togglePublish(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a course (creates DRAFT copy without sessions)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 201, type: AdminCourseDetailDto })
  async duplicate(@Param('id') id: string): Promise<AdminCourseDetailDto> {
    return this.coursesService.duplicate(id);
  }
}
