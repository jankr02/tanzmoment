import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  signal,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BenefitsSpotlightData,
  BenefitCategory,
} from './benefits-spotlight.types';

const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  physical: 'Körperlich',
  emotional: 'Emotional',
  social: 'Sozial',
};

@Component({
  selector: 'tm-benefits-spotlight',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefits-spotlight.component.html',
  styleUrl: './benefits-spotlight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // None so styles reach <b>/<strong> injected via [innerHTML]; all
  // selectors are scoped under the unique .spotlight BEM prefix.
  encapsulation: ViewEncapsulation.None,
})
export class BenefitsSpotlightComponent {
  @Input({ required: true }) data!: BenefitsSpotlightData;

  readonly activeIndex = signal(0);

  private readonly tabRefs =
    viewChildren<ElementRef<HTMLButtonElement>>('tab');

  select(index: number): void {
    this.activeIndex.set(index);
  }

  categoryLabel(category: BenefitCategory): string {
    return CATEGORY_LABELS[category];
  }

  pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.data.benefits.length;
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
    this.tabRefs()[next]?.nativeElement.focus();
  }
}
