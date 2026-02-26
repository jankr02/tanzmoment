// ============================================================================
// CANCELLATION POLICY SERVICE
// ============================================================================

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CancellationPolicy } from '@prisma/client';
import { RefundCalculation, RefundType } from '@tanzmoment/shared/types';

@Injectable()
export class CancellationPolicyService {
  private readonly logger = new Logger(CancellationPolicyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the cancellation policy for a course.
   * Falls back to the default policy if the course has none assigned.
   * Falls back to a hardcoded no-refund policy if no default exists.
   */
  async getPolicyForCourse(courseId: string): Promise<CancellationPolicy> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { cancellationPolicy: true },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    if (course.cancellationPolicy) {
      return course.cancellationPolicy;
    }

    const defaultPolicy = await this.prisma.cancellationPolicy.findFirst({
      where: { isDefault: true },
    });

    if (!defaultPolicy) {
      this.logger.warn('No default cancellation policy found – using no-refund fallback');
      return {
        id: 'fallback',
        name: 'No Policy',
        description: 'No cancellation policy configured',
        fullRefundHours: 0,
        partialRefundHours: 0,
        partialRefundPercent: 0,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return defaultPolicy;
  }

  /**
   * Calculates the refund amount based on policy and session start time.
   * This is the authoritative server-side calculation.
   */
  calculateRefund(
    policy: CancellationPolicy,
    sessionStartTime: Date,
    amountInCents: number
  ): RefundCalculation {
    const hoursUntilSession =
      (sessionStartTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilSession >= policy.fullRefundHours) {
      return {
        type: RefundType.FULL,
        originalAmountInCents: amountInCents,
        refundAmountInCents: amountInCents,
        refundPercent: 100,
        hoursUntilSession: Math.round(hoursUntilSession),
        policyName: policy.name,
        explanation: `Full refund (${Math.round(hoursUntilSession)}h before session, policy: ${policy.fullRefundHours}h)`,
      };
    }

    if (
      policy.partialRefundHours > 0 &&
      hoursUntilSession >= policy.partialRefundHours
    ) {
      const refundAmount = Math.round(
        amountInCents * (policy.partialRefundPercent / 100)
      );
      return {
        type: RefundType.PARTIAL,
        originalAmountInCents: amountInCents,
        refundAmountInCents: refundAmount,
        refundPercent: policy.partialRefundPercent,
        hoursUntilSession: Math.round(hoursUntilSession),
        policyName: policy.name,
        explanation: `Partial refund ${policy.partialRefundPercent}% (${Math.round(hoursUntilSession)}h before session)`,
      };
    }

    return {
      type: RefundType.NONE,
      originalAmountInCents: amountInCents,
      refundAmountInCents: 0,
      refundPercent: 0,
      hoursUntilSession: Math.round(hoursUntilSession),
      policyName: policy.name,
      explanation: `No refund (${Math.round(hoursUntilSession)}h before session, minimum: ${policy.partialRefundHours || policy.fullRefundHours}h)`,
    };
  }

  /**
   * For admin-initiated cancellations: always 100% refund.
   * Studio-cancelled bookings always get their money back.
   */
  calculateAdminRefund(amountInCents: number): RefundCalculation {
    return {
      type: RefundType.FULL,
      originalAmountInCents: amountInCents,
      refundAmountInCents: amountInCents,
      refundPercent: 100,
      hoursUntilSession: 0,
      policyName: 'Admin Override',
      explanation: 'Full refund – cancelled by studio',
    };
  }
}
