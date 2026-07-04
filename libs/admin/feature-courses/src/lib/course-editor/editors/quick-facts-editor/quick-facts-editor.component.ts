import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CourseDetailQuickFactsContent,
  CustomFact,
  QuickFactType,
} from '@tanzmoment/shared/types';
import { nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-quick-facts-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-facts-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickFactsEditorComponent implements OnInit {
  @Input() content: CourseDetailQuickFactsContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailQuickFactsContent | undefined
  >();

  readonly allFactTypes: QuickFactType[] = [
    'price',
    'duration',
    'level',
    'location',
    'nextDate',
    'spotsAvailable',
    'maxParticipants',
  ];

  readonly factLabels: Record<QuickFactType, string> = {
    price: 'Preis',
    duration: 'Dauer',
    level: 'Level',
    location: 'Ort',
    nextDate: 'Nächster Termin',
    spotsAvailable: 'Freie Plätze',
    maxParticipants: 'Max. Teilnehmer',
  };

  factOrder: QuickFactType[] = [];
  hiddenFacts: QuickFactType[] = [];
  customFacts: CustomFact[] = [];

  ngOnInit(): void {
    this.customFacts = (this.content?.customFacts ?? []).map((f) => ({ ...f }));
    this.hiddenFacts = [...(this.content?.hiddenFacts ?? [])];
    this.factOrder = this.normalizeFactOrder(this.content?.factOrder);
  }

  private normalizeFactOrder(saved?: QuickFactType[]): QuickFactType[] {
    const known = (saved ?? []).filter((t) => this.allFactTypes.includes(t));
    const missing = this.allFactTypes.filter((t) => !known.includes(t));
    return [...known, ...missing];
  }

  isFactVisible(type: QuickFactType): boolean {
    return !this.hiddenFacts.includes(type);
  }

  toggleFactVisibility(type: QuickFactType): void {
    if (this.hiddenFacts.includes(type)) {
      this.hiddenFacts = this.hiddenFacts.filter((t) => t !== type);
    } else {
      this.hiddenFacts = [...this.hiddenFacts, type];
    }
    this.emit();
  }

  moveFact(index: number, dir: -1 | 1): void {
    const target = index + dir;
    if (target < 0 || target >= this.factOrder.length) {
      return;
    }
    const next = [...this.factOrder];
    [next[index], next[target]] = [next[target], next[index]];
    this.factOrder = next;
    this.emit();
  }

  addCustomFact(): void {
    this.customFacts = [...this.customFacts, { icon: '', label: '', value: '' }];
  }

  removeCustomFact(index: number): void {
    this.customFacts = this.customFacts.filter((_, i) => i !== index);
    this.emit();
  }

  emit(): void {
    const customFacts = this.customFacts
      .filter((f) => f.label.trim() && f.value.trim())
      .map((f) => ({
        icon: f.icon?.trim() ?? '',
        label: f.label.trim(),
        value: f.value.trim(),
      }));
    const orderChanged = this.factOrder.some(
      (t, i) => t !== this.allFactTypes[i],
    );
    this.contentChange.emit(
      nonEmpty({
        customFacts: customFacts.length ? customFacts : undefined,
        hiddenFacts: this.hiddenFacts.length ? [...this.hiddenFacts] : undefined,
        factOrder: orderChanged ? [...this.factOrder] : undefined,
      }),
    );
  }
}
