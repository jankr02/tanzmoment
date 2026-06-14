import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  signal,
  viewChild,
  viewChildren,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MethodologyTimelineData } from './methodology-timeline.types';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'tm-methodology-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './methodology-timeline.component.html',
  styleUrl: './methodology-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // None so styles reach <em>/<strong> injected via [innerHTML]; all
  // selectors are scoped under the unique .ansatz BEM prefix.
  encapsulation: ViewEncapsulation.None,
})
export class MethodologyTimelineComponent {
  @Input({ required: true }) data!: MethodologyTimelineData;

  private readonly destroyRef = inject(DestroyRef);

  // Declarative state: drives the .is-active / .in-view classes in the template
  readonly activeIndex = signal(0);
  readonly inViewSet = signal<ReadonlySet<number>>(new Set());

  private readonly trailRef = viewChild<ElementRef<HTMLDivElement>>('trail');
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');
  private readonly lineRefs = viewChildren<ElementRef<SVGPathElement>>('line');
  private readonly mainLineRef = viewChild<ElementRef<SVGPathElement>>('mainLine');
  private readonly travelerRefs =
    viewChildren<ElementRef<SVGCircleElement>>('traveler');
  private readonly stationRefs =
    viewChildren<ElementRef<HTMLElement>>('station');

  constructor() {
    afterNextRender(() => this.setup());
  }

  isActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  isInView(index: number): boolean {
    return this.inViewSet().has(index);
  }

  private setup(): void {
    this.buildPath();
    this.updateActive();

    const onScroll = () => {
      this.updateTraveler();
      this.updateActive();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // rAF poller — robust even where 'scroll' events are throttled/absent
    let lastY = -1;
    let rafId = 0;
    const tick = () => {
      const y = window.scrollY || 0;
      if (y !== lastY) {
        lastY = y;
        this.updateTraveler();
        this.updateActive();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = this.stationRefs().findIndex(
              (ref) => ref.nativeElement === entry.target
            );
            if (index >= 0 && !this.inViewSet().has(index)) {
              this.inViewSet.set(new Set(this.inViewSet()).add(index));
            }
          }
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -8% 0px' }
    );
    this.stationRefs().forEach((ref) => io.observe(ref.nativeElement));

    // Fail-safe: reveal everything if the observer never fires
    const revealAllId = window.setTimeout(() => {
      this.inViewSet.set(new Set(this.data.stations.map((_, i) => i)));
    }, 1200);

    const ro = new ResizeObserver(() => this.buildPath());
    const trailEl = this.trailRef()?.nativeElement;
    if (trailEl) {
      ro.observe(trailEl);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => this.buildPath());
    }

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      window.clearTimeout(revealAllId);
      io.disconnect();
      ro.disconnect();
    });
  }

  private nodeCenters(trailRect: DOMRect): Point[] {
    return this.stationRefs().map((ref) => {
      const node = ref.nativeElement.querySelector('.ansatz__node');
      const r = (node ?? ref.nativeElement).getBoundingClientRect();
      return {
        x: r.left - trailRect.left + r.width / 2,
        y: r.top - trailRect.top + r.height / 2,
      };
    });
  }

  private catmullRom(pts: Point[]): string {
    if (pts.length < 2) {
      return '';
    }
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? pts[i + 1];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(
        1
      )} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  private buildPath(): void {
    const trailEl = this.trailRef()?.nativeElement;
    const svgEl = this.svgRef()?.nativeElement;
    if (!trailEl || !svgEl) {
      return;
    }
    const tr = trailEl.getBoundingClientRect();
    svgEl.setAttribute('viewBox', `0 0 ${tr.width} ${tr.height}`);
    svgEl.setAttribute('width', `${tr.width}`);
    svgEl.setAttribute('height', `${tr.height}`);

    const pts = this.nodeCenters(tr);
    if (pts.length < 2) {
      return;
    }

    const first = pts[0];
    const last = pts[pts.length - 1];
    const lead: Point = {
      x: first.x + (first.x < tr.width / 2 ? 26 : -26),
      y: Math.max(0, first.y - 64),
    };
    const tailEnd: Point = {
      x: last.x + (last.x < tr.width / 2 ? 30 : -30),
      y: Math.min(tr.height, last.y + 70),
    };
    const d = this.catmullRom([lead, ...pts, tailEnd]);
    this.lineRefs().forEach((ref) => ref.nativeElement.setAttribute('d', d));
    this.updateTraveler();
  }

  private updateTraveler(): void {
    const mainLine = this.mainLineRef()?.nativeElement;
    const trailEl = this.trailRef()?.nativeElement;
    if (!mainLine || !trailEl || !mainLine.getTotalLength) {
      return;
    }
    const len = mainLine.getTotalLength();
    const tr = trailEl.getBoundingClientRect();
    let prog = (window.innerHeight * 0.5 - tr.top) / tr.height;
    prog = Math.max(0, Math.min(1, prog));
    const pt = mainLine.getPointAtLength(len * prog);
    this.travelerRefs().forEach((ref) => {
      ref.nativeElement.setAttribute('cx', pt.x.toFixed(1));
      ref.nativeElement.setAttribute('cy', pt.y.toFixed(1));
    });
  }

  private updateActive(): void {
    const center = window.innerHeight * 0.5;
    let best = 0;
    let bestDist = Infinity;
    this.stationRefs().forEach((ref, i) => {
      const node = ref.nativeElement.querySelector('.ansatz__node');
      const r = (node ?? ref.nativeElement).getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (this.activeIndex() !== best) {
      this.activeIndex.set(best);
    }
  }
}
