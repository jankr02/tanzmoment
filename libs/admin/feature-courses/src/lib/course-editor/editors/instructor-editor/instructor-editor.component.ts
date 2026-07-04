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
import { CourseDetailInstructorContent } from '@tanzmoment/shared/types';
import { ImageUploadFieldComponent } from '../../../components/image-upload-field/image-upload-field.component';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-instructor-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadFieldComponent],
  templateUrl: './instructor-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorEditorComponent implements OnInit {
  @Input() content: CourseDetailInstructorContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailInstructorContent | undefined
  >();

  bioOverride = '';
  quote = '';
  qualifications: string[] = [];
  imageOverride = '';

  ngOnInit(): void {
    this.bioOverride = this.content?.bioOverride ?? '';
    this.quote = this.content?.quote ?? '';
    this.qualifications = [...(this.content?.qualifications ?? [])];
    this.imageOverride = this.content?.imageOverride ?? '';
  }

  addQualification(): void {
    this.qualifications = [...this.qualifications, ''];
  }

  removeQualification(index: number): void {
    this.qualifications = this.qualifications.filter((_, i) => i !== index);
    this.emit();
  }

  onImg(url: string): void {
    this.imageOverride = url;
    this.emit();
  }

  emit(): void {
    const qualifications = this.qualifications
      .map((q) => q.trim())
      .filter(Boolean);
    this.contentChange.emit(
      nonEmpty({
        bioOverride: clean(this.bioOverride),
        quote: clean(this.quote),
        qualifications: qualifications.length ? qualifications : undefined,
        imageOverride: clean(this.imageOverride),
      }),
    );
  }
}
