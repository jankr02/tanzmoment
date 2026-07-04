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
import { CourseDetailBookingContent } from '@tanzmoment/shared/types';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-booking-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingEditorComponent implements OnInit {
  @Input() content: CourseDetailBookingContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailBookingContent | undefined
  >();

  ctaText = '';
  priceNote = '';
  notice = '';
  includes: string[] = [];

  ngOnInit(): void {
    this.ctaText = this.content?.ctaText ?? '';
    this.priceNote = this.content?.priceNote ?? '';
    this.notice = this.content?.notice ?? '';
    this.includes = [...(this.content?.includes ?? [])];
  }

  addInclude(): void {
    this.includes = [...this.includes, ''];
    this.emit();
  }

  removeInclude(index: number): void {
    this.includes = this.includes.filter((_, i) => i !== index);
    this.emit();
  }

  emit(): void {
    this.contentChange.emit(
      nonEmpty({
        ctaText: clean(this.ctaText),
        priceNote: clean(this.priceNote),
        notice: clean(this.notice),
        includes: this.includes.length ? [...this.includes] : undefined,
      }),
    );
  }
}
