import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

export type BlobVariant =
  | 'organic-1'
  | 'organic-2'
  | 'organic-3'
  | 'organic-4'
  | 'organic-5'
  | 'organic-6';

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
      viewBox="-100 -100 200 200"
      xmlns="http://www.w3.org/2000/svg"
      class="blob__svg"
      [style.transform]="svgTransform"
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

  /**
   * Corner/center preset within the parent. Set to null when placing the blob
   * freely via the top/left/right/bottom inputs (e.g. inside a page-wide layer).
   */
  @Input() position: BlobPosition | null = 'top-right';

  /** Free placement overrides (any CSS length/percent). Win over the preset. */
  @Input() top: string | null = null;
  @Input() left: string | null = null;
  @Input() right: string | null = null;
  @Input() bottom: string | null = null;

  /** Size in px */
  @Input() size = 300;

  /** Opacity (0–1). Keep low (0.06–0.12) for subtle backgrounds. */
  @Input() opacity = 0.08;

  /** Rotation in degrees — vary per instance to avoid a repetitive feel. */
  @Input() rotation = 0;

  /** Mirror the shape horizontally for extra silhouette variety. */
  @Input() flip = false;

  @HostBinding('class')
  get hostClasses(): string {
    return this.position ? `blob blob--${this.position}` : 'blob';
  }

  @HostBinding('style.top') get styleTop(): string | null {
    return this.top;
  }
  @HostBinding('style.left') get styleLeft(): string | null {
    return this.left;
  }
  @HostBinding('style.right') get styleRight(): string | null {
    return this.right;
  }
  @HostBinding('style.bottom') get styleBottom(): string | null {
    return this.bottom;
  }

  @HostBinding('style.--blob-size')
  get blobSize(): string {
    return `${this.size}px`;
  }

  @HostBinding('style.--blob-opacity')
  get blobOpacity(): number {
    return this.opacity;
  }

  get svgTransform(): string {
    const scale = this.flip ? 'scaleX(-1)' : '';
    return `rotate(${this.rotation}deg) ${scale}`.trim();
  }

  /**
   * Organic SVG paths — centered on the origin (viewBox -100 -100 200 200),
   * intentionally asymmetric with differing lobe counts. Combine with
   * `rotation`/`flip`/`size` so no two placements read as the same shape.
   */
  get shapePath(): string {
    const shapes: Record<BlobVariant, string> = {
      'organic-1':
        'M64.4,0C63.3,20.9,52.1,43,33.1,57.3C14.1,71.6,-29.2,95.5,-49.6,85.9C-70,76.4,-90.6,26.3,-89.2,0C-87.8,-26.3,-62.8,-60.3,-41.4,-71.7C-20,-83,21.7,-80,39.3,-68.1C56.9,-56.1,65.4,-20.9,64.4,0Z',
      'organic-2':
        'M61.8,0C59.7,18.4,51.3,33.5,37.8,47.4C24.3,61.4,-2.1,86.5,-19.1,83.8C-36.1,81,-56.6,50.1,-64.2,30.9C-71.9,11.8,-73.2,-15.2,-65,-31.3C-56.8,-47.4,-34.2,-60.2,-15,-65.5C4.2,-70.8,37.4,-73.9,50.2,-63C63,-52,63.8,-18.4,61.8,0Z',
      'organic-3':
        'M95.7,0C95.8,24.5,66,61,42.6,73.8C19.3,86.7,-23.1,89.5,-44.6,77.2C-66,64.9,-85.7,26.7,-86.3,0C-86.8,-26.7,-69.3,-70.7,-47.9,-82.9C-26.4,-95.2,18.4,-87.2,42.4,-73.4C66.3,-59.6,95.7,-24.5,95.7,0Z',
      'organic-4':
        'M78,0C76.6,21.4,73.1,45.4,60.1,60.1C47.1,74.7,16.5,91.4,0,87.9C-16.5,84.3,-23,53.4,-38.8,38.8C-54.6,24.2,-92.2,15.6,-94.9,0C-97.6,-15.6,-70.8,-42.3,-55,-55C-39.2,-67.7,-20.6,-74.1,0,-76.4C20.6,-78.6,55.5,-81.2,68.5,-68.5C81.5,-55.8,79.4,-21.4,78,0Z',
      'organic-5':
        'M89.6,0C90.3,27.2,54.2,80.5,28.7,88.2C3.1,96,-45.3,71.1,-63.8,46.4C-82.4,21.7,-97.3,-39.8,-82.6,-60C-68,-80.2,-4.4,-84.8,24.3,-74.8C53,-64.8,88.8,-27.2,89.6,0Z',
      'organic-6':
        'M66.4,0C70.3,20.8,75,67,61.6,77.2C48.2,87.4,5.5,69.5,-13.9,61C-33.4,52.6,-46.9,41.6,-54.9,26.4C-62.9,11.3,-67.5,-10,-61.9,-29.8C-56.2,-49.6,-37.7,-89.3,-21.1,-92.3C-4.4,-95.2,23.3,-62.9,37.9,-47.5C52.4,-32.1,62.4,-20.8,66.4,0Z',
    };
    return shapes[this.variant];
  }
}
