import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DanceStyleId,
  DANCE_STYLE_COLOR_SCHEMES,
} from '../dance-style-card/dance-style-card.types';

const ILLUSTRATION_URLS: Record<DanceStyleId, string> = {
  accessible: '/assets/illustrations/dance-styles/accessible.svg',
  expressive: '/assets/illustrations/dance-styles/expressive.svg',
  kids: '/assets/illustrations/dance-styles/kids.svg',
  mothers: '/assets/illustrations/dance-styles/mother.svg',
};

@Component({
  selector: 'tm-course-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-placeholder.component.html',
  styleUrl: './course-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursePlaceholderComponent {
  @Input({ required: true })
  set danceStyle(value: string) {
    this._danceStyle.set(value as DanceStyleId);
  }

  @Input() variant: 'card' | 'hero' = 'card';

  private readonly _danceStyle = signal<DanceStyleId>('expressive');

  readonly colors = computed(() => {
    const style = this._danceStyle();
    return DANCE_STYLE_COLOR_SCHEMES[style] ?? DANCE_STYLE_COLOR_SCHEMES.expressive;
  });

  readonly illustrationUrl = computed(() => {
    const style = this._danceStyle();
    return ILLUSTRATION_URLS[style] ?? ILLUSTRATION_URLS.expressive;
  });
}
