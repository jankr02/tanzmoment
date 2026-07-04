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
import { CourseDetailHeroContent } from '@tanzmoment/shared/types';
import { ImageUploadFieldComponent } from '../../../components/image-upload-field/image-upload-field.component';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-hero-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadFieldComponent],
  templateUrl: './hero-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss', './hero-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroEditorComponent implements OnInit {
  /** Base course fields shown in the hero (edited here, not overridden). */
  @Input() title = '';
  @Input() catchPhrase = '';
  @Input() content: CourseDetailHeroContent | undefined;

  @Output() readonly titleChange = new EventEmitter<string>();
  @Output() readonly catchPhraseChange = new EventEmitter<string>();
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailHeroContent | undefined
  >();

  imageUrl = '';
  textColorOverride = '';

  /** Curated overlay-text colors that stay on-brand across hero images. */
  readonly colorPresets: { value: string; label: string }[] = [
    { value: '#FFFFFF', label: 'Weiß' },
    { value: '#F2ECE3', label: 'Creme' },
    { value: '#2E2A25', label: 'Dunkelbraun' },
    { value: '#688B68', label: 'Brand-Grün' },
    { value: '#D0A373', label: 'Gold' },
  ];

  ngOnInit(): void {
    this.imageUrl = this.content?.imageUrl ?? '';
    this.textColorOverride = this.content?.textColorOverride ?? '';
  }

  onTitle(): void {
    this.titleChange.emit(this.title);
  }

  onCatchPhrase(): void {
    this.catchPhraseChange.emit(this.catchPhrase);
  }

  onImg(url: string): void {
    this.imageUrl = url;
    this.emit();
  }

  setColor(value: string): void {
    this.textColorOverride = value;
    this.emit();
  }

  emit(): void {
    this.contentChange.emit(
      nonEmpty({
        imageUrl: clean(this.imageUrl),
        textColorOverride: clean(this.textColorOverride),
      }),
    );
  }
}
