export interface FinanceSummary {
  revenueThisMonth: number;
  pendingAmount: number;
  refundedAmount: number;
  totalRevenue: number;
}

export interface FinancePaymentUser {
  name: string;
  email: string;
}

export interface FinancePayment {
  id: string;
  amountInCents: number;
  status: string;
  method: string | null;
  user: FinancePaymentUser | null;
  guestEmail: string | null;
  course: { title: string };
  session: { startTime: string | Date } | null;
  paidAt: string | Date | null;
  refundedAt: string | Date | null;
  createdAt: string | Date;
}

export interface MonthlyRevenueStat {
  month: string;
  revenue: number;
  count: number;
}

export interface FinancePaymentFilters {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface FinanceListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FinancePaymentListResponse {
  data: FinancePayment[];
  meta: FinanceListMeta;
}
