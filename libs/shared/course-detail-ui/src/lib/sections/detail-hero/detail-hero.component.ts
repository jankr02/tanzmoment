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

  // Tracks the specific URL that failed to load, so a newly provided image
  // is retried instead of being stuck behind a sticky error flag.
  private readonly erroredUrl = signal<string | null>(null);

  // A method (not a computed) because it depends on the plain `content`/`course`
  // @Inputs, which are not signals — it must re-evaluate on every change detection.
  showPlaceholder(): boolean {
    const url = this.imageUrl;
    if (!url) return true;
    return this.erroredUrl() === url;
  }

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

  danceStyleColors(): (typeof DANCE_STYLE_COLOR_SCHEMES)[DanceStyleId] {
    const style = this.course?.danceStyle as DanceStyleId;
    return DANCE_STYLE_COLOR_SCHEMES[style] ?? DANCE_STYLE_COLOR_SCHEMES.expressive;
  }

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
    this.erroredUrl.set(this.imageUrl);
  }
}
