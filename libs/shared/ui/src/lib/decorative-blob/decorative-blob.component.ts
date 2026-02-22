import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

export type BlobVariant = 'organic-1' | 'organic-2' | 'organic-3';
export type BlobPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';

@Component({
  selector: 'tm-decorative-blob',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      class="blob__svg"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="shapePath" fill="currentColor" />
    </svg>
  `,
  styleUrl: './decorative-blob.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecorativeBlobComponent {
  /** Blob shape variant */
  @Input() variant: BlobVariant = 'organic-1';

  /** Position within the parent section */
  @Input() position: BlobPosition = 'top-right';

  /** Size in px */
  @Input() size = 300;

  /** Opacity (0–1). Keep low (0.05–0.08) for subtle backgrounds. */
  @Input() opacity = 0.07;

  @HostBinding('class')
  get hostClasses(): string {
    return `blob blob--${this.position}`;
  }

  @HostBinding('style.--blob-size')
  get blobSize(): string {
    return `${this.size}px`;
  }

  @HostBinding('style.--blob-opacity')
  get blobOpacity(): number {
    return this.opacity;
  }

  /** Organic SVG paths — intentionally asymmetric and soft. */
  get shapePath(): string {
    const shapes: Record<BlobVariant, string> = {
      'organic-1':
        'M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.3,29,73.2,42.3C65.1,55.5,54.5,67.5,41.3,74.8C28.1,82.1,12.4,84.7,-2.4,83.1C-17.2,81.4,-31.2,75.5,-44.4,67.5C-57.6,59.5,-70,49.3,-76.4,36.2C-82.8,23.1,-83.3,7.1,-80.2,-7.7C-77.1,-22.5,-70.4,-36.1,-60.4,-46.4C-50.4,-56.7,-37.1,-63.7,-23.5,-71C-9.9,-78.3,4,-85.9,18.4,-85.4C32.8,-84.9,47.5,-76.3,44.7,-76.4Z',
      'organic-2':
        'M39.5,-67.3C52.9,-60.1,66.8,-52.6,74.5,-40.9C82.2,-29.2,83.7,-13.1,81.3,1.4C78.9,15.9,72.6,28.7,64.1,40.1C55.6,51.5,44.9,61.5,32.4,68.2C19.9,74.9,5.6,78.3,-8.2,76.8C-22,75.3,-35.3,68.9,-46.8,60.3C-58.3,51.7,-68,40.9,-73.4,28.1C-78.8,15.3,-79.9,0.5,-77.2,-13.1C-74.5,-26.7,-68,-39.1,-57.8,-47.7C-47.6,-56.3,-33.7,-61.1,-20.5,-68.5C-7.3,-75.9,5.2,-85.9,17.8,-85.1C30.4,-84.3,43,-67.7,39.5,-67.3Z',
      'organic-3':
        'M45.2,-77.5C59.1,-69.9,71.6,-59.4,78.9,-46.1C86.2,-32.8,88.3,-16.4,86.8,-0.9C85.3,14.6,80.2,29.2,72.1,42.2C64,55.2,52.9,66.6,39.4,73.7C25.9,80.8,10,83.6,-4.7,81.2C-19.4,78.8,-32.8,71.2,-45.5,62.4C-58.2,53.6,-70.2,43.6,-76.5,30.7C-82.8,17.8,-83.4,2,-79.7,-12.1C-76,-26.2,-68,-38.6,-57.2,-47.9C-46.4,-57.2,-32.8,-63.4,-19.4,-71.5C-6,-79.6,7.2,-89.6,20.6,-89.1C34,-88.6,47.6,-77.6,45.2,-77.5Z',
    };
    return shapes[this.variant];
  }
}
