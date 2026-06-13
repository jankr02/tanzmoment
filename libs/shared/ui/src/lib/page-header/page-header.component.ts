import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shared page header: centered eyebrow + title + subtitle.
 *
 * Optional content projected via <ng-content> renders above the eyebrow
 * (e.g. an avatar or badge).
 */
@Component({
  selector: 'ui-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
