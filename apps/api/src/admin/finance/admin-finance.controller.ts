import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { AdminFinanceService } from './admin-finance.service';
import {
  FinanceSummaryDto,
  FinancePaymentListResponseDto,
  MonthlyRevenueStatDto,
} from './dto/finance-response.dto';
import {
  ExportQueryDto,
  FinancePaymentsQueryDto,
  MonthlyStatsQueryDto,
} from './dto/finance-query.dto';

@ApiTags('Admin - Finance')
@Controller('admin/finance')
@AdminOnly()
export class AdminFinanceController {
  constructor(private readonly financeService: AdminFinanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary for current month and all-time' })
  @ApiResponse({ status: 200, type: FinanceSummaryDto })
  async getSummary(): Promise<FinanceSummaryDto> {
    return this.financeService.getSummary();
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get paginated payment list with optional filters' })
  @ApiResponse({ status: 200, type: FinancePaymentListResponseDto })
  async getPayments(
    @Query() query: FinancePaymentsQueryDto,
  ): Promise<FinancePaymentListResponseDto> {
    return this.financeService.getPayments(query);
  }

  @Get('monthly-stats')
  @ApiOperation({ summary: 'Get monthly revenue statistics for chart display' })
  @ApiResponse({ status: 200, type: [MonthlyRevenueStatDto] })
  async getMonthlyStats(
    @Query() query: MonthlyStatsQueryDto,
  ): Promise<MonthlyRevenueStatDto[]> {
    return this.financeService.getMonthlyStats(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Download payments as CSV file' })
  async exportCsv(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const csv = await this.financeService.exportCsv(query.from, query.to);
    const filename = this.buildFilename(query.from, query.to);

    res
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      .send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  }

  private buildFilename(from?: string, to?: string): string {
    const parts = ['zahlungen'];
    if (from) parts.push(from);
    if (to) parts.push(to);
    return `${parts.join('_')}.csv`;
  }
}
