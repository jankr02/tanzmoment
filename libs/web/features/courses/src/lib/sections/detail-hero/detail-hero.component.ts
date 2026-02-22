// ============================================================================
// DETAIL HERO SECTION
// ============================================================================
// Large visual stage: course image + overlay with title + dance style badge.
// CMS fields from detailContent.hero are used with course data fallbacks.
// ============================================================================

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CourseDetailData,
  CourseDetailHeroContent,
} from '../../types/course-detail.types';
import { DANCE_STYLES } from '@tanzmoment/shared/types';

@Component({
  selector: 'app-detail-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-hero.component.html',
  styleUrl: './detail-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailHeroComponent {
  /** Course data (required) */
  @Input({ required: true }) course!: CourseDetailData;

  /** CMS override content (optional) */
  @Input() content?: CourseDetailHeroContent;

  // ─── Resolved Values (CMS → Fallback) ──────────────────────────────────

  get headline(): string {
    return this.content?.headlineOverride ?? this.course.title;
  }

  get subHeadline(): string {
    return this.content?.subHeadline ?? this.course.catchPhrase ?? '';
  }

  get imageUrl(): string {
    return (
      this.content?.imageUrl ??
      this.course.imageUrl ??
      '/assets/images/placeholder-course.jpg'
    );
  }

  /** Dance style label for badge (from DANCE_STYLES constants) */
  get danceStyleLabel(): string {
    const styleMap: Record<string, string> = {
      accessible: DANCE_STYLES.ACCESSIBLE.label,
      expressive: DANCE_STYLES.EXPRESSIVE.label,
      kids: DANCE_STYLES.KIDS.label,
      mothers: DANCE_STYLES.MOTHERS.label,
    };
    return styleMap[this.course.danceStyle] ?? this.course.danceStyle;
  }

  /** Text color override (for light backgrounds) */
  get textColor(): string {
    return this.content?.textColorOverride ?? '#FFFFFF';
  }
}
