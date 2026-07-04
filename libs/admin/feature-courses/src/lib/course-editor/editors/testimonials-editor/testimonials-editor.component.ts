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
  CourseDetailSocialProofContent,
  Testimonial,
} from '@tanzmoment/shared/types';
import { ImageUploadFieldComponent } from '../../../components/image-upload-field/image-upload-field.component';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-testimonials-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadFieldComponent],
  templateUrl: './testimonials-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsEditorComponent implements OnInit {
  @Input() content: CourseDetailSocialProofContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailSocialProofContent | undefined
  >();

  headline = '';
  testimonials: Testimonial[] = [];

  ngOnInit(): void {
    this.headline = this.content?.headline ?? '';
    this.testimonials = (this.content?.testimonials ?? []).map((t) => ({
      ...t,
    }));
  }

  addTestimonial(): void {
    this.testimonials = [
      ...this.testimonials,
      { text: '', authorName: '', rating: 5 },
    ];
  }

  removeTestimonial(index: number): void {
    this.testimonials = this.testimonials.filter((_, i) => i !== index);
    this.emit();
  }

  onImg(index: number, url: string): void {
    this.testimonials = this.testimonials.map((t, i) =>
      i === index ? { ...t, imageUrl: url } : t,
    );
    this.emit();
  }

  emit(): void {
    this.contentChange.emit(
      nonEmpty({
        headline: clean(this.headline),
        testimonials: this.testimonials
          .filter((t) => t.text.trim() && t.authorName.trim())
          .map((t) => ({ ...t, imageUrl: t.imageUrl?.trim() || undefined })),
      }),
    );
  }
}
