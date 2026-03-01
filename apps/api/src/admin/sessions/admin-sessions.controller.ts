import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { AdminSessionsService } from './admin-sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateSessionSeriesDto } from './dto/create-session-series.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionParticipantDto } from './dto/session-participant.dto';
import { AdminSessionDto } from '../courses/dto/admin-course-response.dto';

@ApiTags('Admin - Sessions')
@Controller('admin/sessions')
@AdminOnly()
export class AdminSessionsController {
  constructor(private readonly sessionsService: AdminSessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a single session' })
  @ApiResponse({ status: 201, type: AdminSessionDto })
  async create(@Body() dto: CreateSessionDto): Promise<AdminSessionDto> {
    return this.sessionsService.create(dto);
  }

  @Post('series')
  @ApiOperation({ summary: 'Create a recurring session series' })
  @ApiResponse({ status: 201 })
  async createSeries(
    @Body() dto: CreateSessionSeriesDto,
  ): Promise<{ created: number; sessions: AdminSessionDto[] }> {
    return this.sessionsService.createSeries(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, type: AdminSessionDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ): Promise<AdminSessionDto> {
    return this.sessionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 204 })
  async cancel(@Param('id') id: string): Promise<void> {
    return this.sessionsService.cancel(id);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get participant list for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, type: [SessionParticipantDto] })
  async getParticipants(
    @Param('id') id: string,
  ): Promise<SessionParticipantDto[]> {
    return this.sessionsService.getParticipants(id);
  }
}
