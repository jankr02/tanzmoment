import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSession, AdminLocation } from '@tanzmoment/admin/data-access';
import { CourseDetailContent } from '@tanzmoment/shared/types';

interface PreviewData {
  title: string;
  danceStyle: string;
  targetGroup: string;
  level: string;
  shortDescription: string;
  description: string;
  catchPhrase: string;
  imageUrl: string;
  priceInEuros: number;
  isFree: boolean;
  duration: number;
  maxParticipants: number;
  bookingMode: string;
  visibility: string;
  isMarkedAsHighlighted: boolean;
  metaTitle: string;
  metaDescription: string;
  detailContent?: CourseDetailContent;
}

const DANCE_STYLE_LABELS: Record<string, string> = {
  ACCESSIBLE_DANCE: 'Accessible Dance',
  EXPRESSIVE_DANCE: 'Expressive Dance',
  KIDS: 'Kindertanz',
  MOTHERS: 'Mama tanzt',
};

const TARGET_GROUP_LABELS: Record<string, string> = {
  ADULTS: 'Erwachsene',
  KIDS: 'Kinder',
  TEENS: 'Jugendliche',
  SENIORS: 'Senioren',
  MOTHERS: 'Muetter',
  MIXED: 'Gemischt',
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Anfaenger',
  INTERMEDIATE: 'Mittelstufe',
  ADVANCED: 'Fortgeschritten',
  ALL_LEVELS: 'Alle Levels',
};

const BOOKING_MODE_LABELS: Record<string, string> = {
  FULL_COURSE: 'Ganzer Kurs',
  PER_SESSION: 'Einzelsession',
};

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Oeffentlich',
  UNLISTED: 'Nicht gelistet',
  PRIVATE: 'Privat',
};

@Component({
  selector: 'admin-step-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-preview.component.html',
  styleUrls: ['./step-basics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepPreviewComponent {
  @Input({ required: true }) data!: PreviewData;
  @Input() sessions: AdminSession[] = [];
  @Input() locations: AdminLocation[] = [];
  @Input() isEditMode = false;

  getDanceStyleLabel(val: string): string {
    return DANCE_STYLE_LABELS[val] ?? val;
  }

  getTargetGroupLabel(val: string): string {
    return TARGET_GROUP_LABELS[val] ?? val;
  }

  getLevelLabel(val: string): string {
    return LEVEL_LABELS[val] ?? val;
  }

  getBookingModeLabel(val: string): string {
    return BOOKING_MODE_LABELS[val] ?? val;
  }

  getVisibilityLabel(val: string): string {
    return VISIBILITY_LABELS[val] ?? val;
  }

  formatPrice(price: number, isFree: boolean): string {
    if (isFree) return 'Kostenlos';
    return `${price.toFixed(2).replace('.', ',')} \u20AC`;
  }

  formatDuration(mins: number): string {
    if (mins < 60) return `${mins} Min.`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`;
  }

  getLocationName(id: string): string {
    return this.locations.find(l => l.id === id)?.name ?? id;
  }

  formatSessionDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  }

  formatSessionTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  get highlightCount(): number {
    return this.data.detailContent?.description?.highlights?.length ?? 0;
  }

  get courseFlowStepCount(): number {
    return this.data.detailContent?.courseFlow?.steps?.length ?? 0;
  }

  get testimonialCount(): number {
    return this.data.detailContent?.socialProof?.testimonials?.length ?? 0;
  }

  get faqItemCount(): number {
    return this.data.detailContent?.faq?.items?.length ?? 0;
  }

  get hasContentData(): boolean {
    return (
      this.highlightCount > 0 ||
      this.courseFlowStepCount > 0 ||
      this.testimonialCount > 0 ||
      this.faqItemCount > 0
    );
  }
}
