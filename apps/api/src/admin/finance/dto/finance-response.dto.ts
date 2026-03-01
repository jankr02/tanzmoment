import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinanceSummaryDto {
  @ApiProperty({ description: 'Revenue this month in cents' }) revenueThisMonth!: number;
  @ApiProperty({ description: 'Total pending payment amount in cents' }) pendingAmount!: number;
  @ApiProperty({ description: 'Total refunded amount in cents' }) refundedAmount!: number;
  @ApiProperty({ description: 'Total all-time revenue in cents' }) totalRevenue!: number;
}

export class FinancePaymentUserDto {
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
}

export class FinancePaymentCourseDto {
  @ApiProperty() title!: string;
}

export class FinancePaymentSessionDto {
  @ApiProperty() startTime!: Date;
}

export class FinancePaymentDto {
  @ApiProperty() id!: string;
  @ApiProperty() amountInCents!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) method!: string | null;
  @ApiPropertyOptional({ type: FinancePaymentUserDto, nullable: true }) user!: FinancePaymentUserDto | null;
  @ApiPropertyOptional({ nullable: true }) guestEmail!: string | null;
  @ApiProperty({ type: FinancePaymentCourseDto }) course!: FinancePaymentCourseDto;
  @ApiPropertyOptional({ type: FinancePaymentSessionDto, nullable: true }) session!: FinancePaymentSessionDto | null;
  @ApiPropertyOptional({ nullable: true }) paidAt!: Date | null;
  @ApiPropertyOptional({ nullable: true }) refundedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
}

export class FinanceListMetaDto {
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}

export class FinancePaymentListResponseDto {
  @ApiProperty({ type: [FinancePaymentDto] }) data!: FinancePaymentDto[];
  @ApiProperty({ type: FinanceListMetaDto }) meta!: FinanceListMetaDto;
}

export class MonthlyRevenueStatDto {
  @ApiProperty({ description: 'Month label, e.g. "2026-03"' }) month!: string;
  @ApiProperty({ description: 'Total revenue in cents for this month' }) revenue!: number;
  @ApiProperty({ description: 'Number of paid transactions this month' }) count!: number;
}
