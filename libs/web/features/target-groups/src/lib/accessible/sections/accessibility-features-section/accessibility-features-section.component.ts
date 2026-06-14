import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityFeaturesSectionData } from './accessibility-features-section.types';

@Component({
  selector: 'tm-accessibility-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-features-section.component.html',
  styleUrl: './accessibility-features-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityFeaturesSectionComponent {
  @Input({ required: true }) set data(value: AccessibilityFeaturesSectionData) {
    this._data.set(value);
  }
  get data(): AccessibilityFeaturesSectionData {
    return this._data();
  }
  private readonly _data = signal<AccessibilityFeaturesSectionData>({
    headline: '',
    subheadline: '',
    prompt: '',
    needs: [],
    features: [],
  });

  readonly selectedNeed = signal<number | null>(null);

  private readonly matchSet = computed<ReadonlySet<number> | null>(() => {
    const index = this.selectedNeed();
    if (index === null) {
      return null;
    }
    return new Set(this._data().needs[index].matches);
  });

  readonly announcement = computed(() => {
    const index = this.selectedNeed();
    const d = this._data();
    if (index === null) {
      return '';
    }
    const need = d.needs[index];
    return `${need.matches.length} von ${d.features.length} Angeboten passen zu „${need.label}".`;
  });

  isNeedActive(index: number): boolean {
    return this.selectedNeed() === index;
  }

  /** 'match' | 'dim' | 'neutral' — drives the per-row highlight/dim styling. */
  rowState(index: number): 'match' | 'dim' | 'neutral' {
    const set = this.matchSet();
    if (set === null) {
      return 'neutral';
    }
    return set.has(index) ? 'match' : 'dim';
  }

  toggleNeed(index: number): void {
    this.selectedNeed.update((current) => (current === index ? null : index));
  }

  iconVar(path: string): string {
    return `url('${path}')`;
  }
}
