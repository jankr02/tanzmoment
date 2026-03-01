export interface AdminCustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bookingCount: number;
  lastActivity: string | Date | null;
  isActive: boolean;
  createdAt: string | Date;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string | Date;
}

export interface AdminCustomerBooking {
  id: string;
  status: string;
  course: { id: string; title: string; slug: string };
  session: { id: string; startTime: string | Date; locationName: string } | null;
  payment: { amountInCents: number; status: string; paidAt: string | Date | null } | null;
  createdAt: string | Date;
}

export interface AdminCustomerDetail extends AdminCustomerListItem {
  bookings: AdminCustomerBooking[];
  notes: CustomerNote[];
}

export interface CustomerListFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomerListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerListResponse {
  data: AdminCustomerListItem[];
  meta: CustomerListMeta;
}
