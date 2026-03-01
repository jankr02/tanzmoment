export interface AdminBookingListItem {
  id: string;
  status: string;
  isGuestBooking: boolean;
  user: { email: string; name: string } | null;
  guestEmail: string | null;
  guestName: string | null;
  course: { id: string; title: string; slug: string; danceStyle: string };
  session: { id: string; startTime: string | Date; location: string } | null;
  payment: {
    id: string;
    status: string;
    amountInCents: number;
    method: string;
  } | null;
  waitlistPosition: number | null;
  createdAt: string | Date;
  cancelledAt: string | Date | null;
}

export interface AdminBookingDetail extends AdminBookingListItem {
  // Extended session info (when session is fully included)
  sessionDetail?: {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    status: string;
    locationId: string;
  } | null;
}

export interface BookingListFilters {
  status?: string;
  courseId?: string;
  from?: string;
  to?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export interface BookingListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingListResponse {
  data: AdminBookingListItem[];
  meta: BookingListMeta;
}
