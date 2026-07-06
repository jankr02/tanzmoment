import {
  Component,
  Input,
  ElementRef,
  signal,
  viewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OriginSectionData, StoryChapter } from './origin-section.types';

@Component({
  selector: 'tm-origin-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './origin-section.component.html',
  styleUrl: './origin-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OriginSectionComponent {
  @Input({ required: true }) data!: OriginSectionData;

  /** Index of the active story chapter. */
  readonly activeChapter = signal(0);

  /** Indices of the value cards currently expanded (each opens independently). */
  readonly openCards = signal<ReadonlySet<number>>(new Set<number>());

  private readonly tabButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('tab');

  selectChapter(index: number): void {
    this.activeChapter.set(index);
  }

  currentChapter(): StoryChapter {
    return this.data.chapters[this.activeChapter()];
  }

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const count = this.data.chapters.length;
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
    this.selectChapter(next);
    this.tabButtons()[next]?.nativeElement.focus();
  }

  setCardOpen(index: number, open: boolean): void {
    this.openCards.update((current) => {
      const next = new Set(current);
      if (open) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });
  }

  toggleCard(index: number): void {
    this.openCards.update((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  isCardOpen(index: number): boolean {
    return this.openCards().has(index);
  }
}
