import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@AdminOnly()
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data including upcoming sessions, action items, and stats',
    type: DashboardResponseDto,
  })
  async getDashboard(): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard();
  }
}
