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
import { RichTextEditorComponent } from '../shared/rich-text-editor.component';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-description-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './description-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionEditorComponent implements OnInit {
  /** Base course description (rendered as the main description text). */
  @Input() description = '';
  @Input() content: CourseDetailDescriptionContent | undefined;

  @Output() readonly descriptionChange = new EventEmitter<string>();
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailDescriptionContent | undefined
  >();

  headline = '';
  lead = '';
  whatYouLearn = '';
  targetAudienceHeadline = '';
  targetAudienceBody = '';
  highlights: CourseHighlight[] = [];
  showWatermark = true;

  ngOnInit(): void {
    this.headline = this.content?.headline ?? '';
    this.lead = this.content?.lead ?? '';
    this.whatYouLearn = this.content?.whatYouLearn ?? '';
    this.targetAudienceHeadline = this.content?.targetAudience?.headline ?? '';
    this.targetAudienceBody = this.content?.targetAudience?.body ?? '';
    this.highlights = (this.content?.highlights ?? []).map((h) => ({ ...h }));
    this.showWatermark = this.content?.showWatermark ?? true;
  }

  onDescriptionChange(html: string): void {
    this.description = html;
    this.descriptionChange.emit(html);
  }

  addHighlight(): void {
    this.highlights = [...this.highlights, { text: '' }];
    this.emit();
  }

  removeHighlight(index: number): void {
    this.highlights = this.highlights.filter((_, i) => i !== index);
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
        lead: clean(this.lead),
        whatYouLearn: clean(this.whatYouLearn),
        targetAudience,
        highlights: this.highlights.map((h) => ({ ...h })),
        showWatermark: this.showWatermark ? undefined : false,
      }),
    );
  }
}
