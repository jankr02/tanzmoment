import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  computed,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrustGroup } from './trust-rings.types';
import { TRUST_GROUPS, TRUST_GUARANTEE } from './trust-rings.data';

@Component({
  selector: 'tm-trust-rings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trust-rings.component.html',
  styleUrl: './trust-rings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrustRingsComponent {
  readonly group = input.required<TrustGroup>();

  readonly activeLayer = signal(0);

  private readonly rowRefs = viewChildren<ElementRef<HTMLElement>>('row');

  readonly guarantee = TRUST_GUARANTEE;

  // Ring geometry (viewBox 0 0 440 440, center 220/220)
  readonly cx = 220;
  readonly cy = 220;
  readonly radii = [64, 96, 128, 160];
  readonly ringOrder = [3, 2, 1, 0]; // outer painted first so inner sits on top
  readonly coreRadius = 48;
  readonly coreTransform = `translate(${220} ${220}) scale(1.72) translate(-12 -12)`;

  readonly theme = computed(() => TRUST_GROUPS[this.group()]);

  readonly summaryLabel = computed(() => {
    const t = this.theme();
    const layers = t.layers.map((l, i) => `${i + 1}. ${l.title}`).join(', ');
    return `${t.heading}. Vier Schichten: ${layers}.`;
  });

  ringStrokeWidth(index: number): number {
    return this.activeLayer() === index ? 26 : 20;
  }

  ringOpacity(index: number): number {
    return this.activeLayer() === index ? 1 : 0.38;
  }

  markerY(index: number): number {
    return this.cy - this.radii[index];
  }

  select(index: number): void {
    this.activeLayer.set(index);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.theme().layers.length;
    let next = index;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (index + 1) % count;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (index - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(next);
    this.rowRefs()[next]?.nativeElement.focus();
  }
}
