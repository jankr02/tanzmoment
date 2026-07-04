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
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoursePlaceholderComponent,
  DANCE_STYLE_COLOR_SCHEMES,
  DanceStyleId,
} from '@tanzmoment/shared/ui';

import {
  CourseDetailData,
  CourseDetailHeroContent,
} from '../../types/course-detail.types';
import { DANCE_STYLES } from '@tanzmoment/shared/types';

@Component({
  selector: 'app-detail-hero',
  standalone: true,
  imports: [CommonModule, CoursePlaceholderComponent],
  templateUrl: './detail-hero.component.html',
  styleUrl: './detail-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailHeroComponent {
  @Input({ required: true }) course!: CourseDetailData;
  @Input() content?: CourseDetailHeroContent;

  readonly imageError = signal(false);

  readonly showPlaceholder = computed(() => {
    const hasImage = this.content?.imageUrl || this.course?.imageUrl;
    return !hasImage || this.imageError();
  });

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
      ''
    );
  }

  get danceStyleLabel(): string {
    const styleMap: Record<string, string> = {
      accessible: DANCE_STYLES.ACCESSIBLE.label,
      expressive: DANCE_STYLES.EXPRESSIVE.label,
      kids: DANCE_STYLES.KIDS.label,
      mothers: DANCE_STYLES.MOTHERS.label,
    };
    return styleMap[this.course.danceStyle] ?? this.course.danceStyle;
  }

  readonly danceStyleColors = computed(() => {
    const style = this.course?.danceStyle as DanceStyleId;
    return DANCE_STYLE_COLOR_SCHEMES[style] ?? DANCE_STYLE_COLOR_SCHEMES.expressive;
  });

  get textColor(): string {
    if (this.showPlaceholder()) return this.danceStyleColors().buttonBg ?? '#2E2A25';
    return this.content?.textColorOverride ?? '#FFFFFF';
  }

  get badgeBg(): string {
    if (this.showPlaceholder()) return this.danceStyleColors().buttonBg ?? '#688B68';
    return '';
  }

  get badgeText(): string {
    if (this.showPlaceholder()) return '#FFFFFF';
    return '';
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}
