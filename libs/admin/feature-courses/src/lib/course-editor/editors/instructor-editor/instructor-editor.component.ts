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

  role = '';
  quote = '';
  photoCredit = '';
  imageOverride = '';

  ngOnInit(): void {
    this.role = this.content?.role ?? '';
    this.quote = this.content?.quote ?? '';
    this.photoCredit = this.content?.photoCredit ?? '';
    this.imageOverride = this.content?.imageOverride ?? '';
  }

  onImg(url: string): void {
    this.imageOverride = url;
    this.emit();
  }

  emit(): void {
    this.contentChange.emit(
      nonEmpty({
        role: clean(this.role),
        quote: clean(this.quote),
        photoCredit: clean(this.photoCredit),
        imageOverride: clean(this.imageOverride),
      }),
    );
  }
}
