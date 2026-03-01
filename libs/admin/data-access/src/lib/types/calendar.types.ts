export type CalendarView = 'week' | 'month';

export interface CalendarSession {
  id: string;
  courseId: string;
  courseTitle: string;
  danceStyle: string;
  startTime: string;
  endTime: string;
  locationName: string;
  bookedCount: number;
  maxParticipants: number;
  status: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: CalendarSession[];
}
