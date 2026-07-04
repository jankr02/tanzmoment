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
  CourseDetailDescriptionContent,
  CourseHighlight,
} from '@tanzmoment/shared/types';
import { ImageUploadFieldComponent } from '../../../components/image-upload-field/image-upload-field.component';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-description-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadFieldComponent],
  templateUrl: './description-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionEditorComponent implements OnInit {
  @Input() content: CourseDetailDescriptionContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailDescriptionContent | undefined
  >();

  headline = '';
  imageUrl = '';
  imageAlt = '';
  imagePosition: 'left' | 'right' = 'right';
  targetAudienceHeadline = '';
  targetAudienceBody = '';
  highlights: CourseHighlight[] = [];

  private body?: string;

  ngOnInit(): void {
    this.headline = this.content?.headline ?? '';
    this.imageUrl = this.content?.imageUrl ?? '';
    this.imageAlt = this.content?.imageAlt ?? '';
    this.imagePosition = this.content?.imagePosition ?? 'right';
    this.targetAudienceHeadline = this.content?.targetAudience?.headline ?? '';
    this.targetAudienceBody = this.content?.targetAudience?.body ?? '';
    this.highlights = (this.content?.highlights ?? []).map((h) => ({ ...h }));
    this.body = this.content?.body;
  }

  addHighlight(): void {
    this.highlights = [...this.highlights, { text: '' }];
  }

  removeHighlight(index: number): void {
    this.highlights = this.highlights.filter((_, i) => i !== index);
    this.emit();
  }

  onImg(url: string): void {
    this.imageUrl = url;
    this.emit();
  }

  emit(): void {
    const targetAudience = this.targetAudienceBody.trim()
      ? {
          headline: clean(this.targetAudienceHeadline),
          body: this.targetAudienceBody.trim(),
        }
      : undefined;
    this.contentChange.emit(
      nonEmpty({
        headline: clean(this.headline),
        body: this.body,
        imageUrl: clean(this.imageUrl),
        imageAlt: clean(this.imageAlt),
        imagePosition: this.imageUrl.trim() ? this.imagePosition : undefined,
        targetAudience,
        highlights: this.highlights.filter((h) => h.text.trim()),
      }),
    );
  }
}
