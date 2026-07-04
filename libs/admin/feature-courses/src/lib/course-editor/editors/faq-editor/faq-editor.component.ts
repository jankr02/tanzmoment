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
import { CourseDetailFaqContent, FaqItem } from '@tanzmoment/shared/types';
import { RichTextEditorComponent } from '../shared/rich-text-editor.component';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-faq-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './faq-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqEditorComponent implements OnInit {
  @Input() content: CourseDetailFaqContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailFaqContent | undefined
  >();

  headline = '';
  items: FaqItem[] = [];

  ngOnInit(): void {
    this.headline = this.content?.headline ?? '';
    this.items = (this.content?.items ?? []).map((item) => ({ ...item }));
  }

  addItem(): void {
    this.items = [...this.items, { question: '', answer: '' }];
  }

  removeItem(index: number): void {
    this.items = this.items.filter((_, i) => i !== index);
    this.emit();
  }

  onAnswerChange(item: FaqItem, html: string): void {
    item.answer = html;
    this.emit();
  }

  emit(): void {
    this.contentChange.emit(
      nonEmpty({
        headline: clean(this.headline),
        items: this.items.filter((f) => f.question.trim() && f.answer.trim()),
      }),
    );
  }
}
