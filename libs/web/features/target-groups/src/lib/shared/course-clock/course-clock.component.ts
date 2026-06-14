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
import { CourseClockData } from './course-clock.types';

interface Segment {
  index: number;
  d: string;
  color: string;
  dim: boolean;
}

const CX = 200;
const CY = 200;
const RO = 168;
const RI = 104;
const GAP = 2.2;

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function donutArc(
  cx: number,
  cy: number,
  rO: number,
  rI: number,
  s: number,
  e: number
): string {
  const large = e - s > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, rO, s);
  const [x2, y2] = polar(cx, cy, rO, e);
  const [x3, y3] = polar(cx, cy, rI, e);
  const [x4, y4] = polar(cx, cy, rI, s);
  return (
    `M${x1.toFixed(2)} ${y1.toFixed(2)} A${rO} ${rO} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} ` +
    `L${x3.toFixed(2)} ${y3.toFixed(2)} A${rI} ${rI} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`
  );
}

@Component({
  selector: 'tm-course-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-clock.component.html',
  styleUrl: './course-clock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseClockComponent {
  readonly data = input.required<CourseClockData>();

  readonly activeIndex = signal(2);

  private readonly rowRefs = viewChildren<ElementRef<HTMLElement>>('row');

  readonly cx = CX;
  readonly cy = CY;
  readonly innerRadius = RI - 6;

  readonly totalMinutes = computed(() =>
    this.data().phases.reduce((sum, p) => sum + p.minutes, 0)
  );

  readonly segments = computed<Segment[]>(() => {
    const phases = this.data().phases;
    const total = this.totalMinutes();
    const active = this.activeIndex();
    let acc = 0;
    return phases.map((p, i) => {
      const start = (acc / total) * 360;
      acc += p.minutes;
      const end = (acc / total) * 360;
      const on = active === i;
      const rO = on ? RO + 9 : RO;
      return {
        index: i,
        d: donutArc(CX, CY, rO, RI, start + GAP / 2, end - GAP / 2),
        color: p.color,
        dim: !on,
      };
    });
  });

  readonly activePhase = computed(() => this.data().phases[this.activeIndex()]);

  readonly summaryLabel = computed(() => {
    const phases = this.data().phases;
    const parts = phases.map((p) => `${p.name} ${p.minutes}`).join(', ');
    return `Kursstunde: ${this.totalMinutes()} Minuten in ${phases.length} Phasen — ${parts}`;
  });

  /** Darkened, AA-safe variant of a phase colour for text/numerals. */
  ink(color: string): string {
    return `color-mix(in srgb, ${color} 72%, var(--color-text-primary))`;
  }

  /** Very light tint of a phase colour for the minutes pill background. */
  pillBg(color: string): string {
    return `color-mix(in srgb, ${color} 16%, var(--color-surface))`;
  }

  select(index: number): void {
    this.activeIndex.set(index);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.data().phases.length;
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
