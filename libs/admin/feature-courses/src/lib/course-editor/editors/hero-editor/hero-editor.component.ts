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
  @Input() content: CourseDetailHeroContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailHeroContent | undefined
  >();

  headlineOverride = '';
  subHeadline = '';
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
    this.headlineOverride = this.content?.headlineOverride ?? '';
    this.subHeadline = this.content?.subHeadline ?? '';
    this.imageUrl = this.content?.imageUrl ?? '';
    this.textColorOverride = this.content?.textColorOverride ?? '';
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
        headlineOverride: clean(this.headlineOverride),
        subHeadline: clean(this.subHeadline),
        imageUrl: clean(this.imageUrl),
        textColorOverride: clean(this.textColorOverride),
      }),
    );
  }
}
