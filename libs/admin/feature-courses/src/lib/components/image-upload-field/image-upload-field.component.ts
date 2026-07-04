import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '@tanzmoment/admin/data-access';

@Component({
  selector: 'admin-image-upload-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload-field.component.html',
  styleUrls: ['./image-upload-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadFieldComponent {
  private readonly adminApi = inject(AdminApiService);

  @Input() value = '';
  @Input() label = 'Bild';
  @Input() hint = 'Optional — JPG, PNG oder WebP (max. 8 MB)';
  @Output() readonly valueChange = new EventEmitter<string>();

  @ViewChild('imageInput', { static: true })
  private readonly imageInput!: ElementRef<HTMLInputElement>;

  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  triggerUpload(): void {
    this.imageInput.nativeElement.click();
  }

  removeImage(): void {
    this.value = '';
    this.uploadError.set(null);
    this.valueChange.emit('');
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.adminApi.uploadCourseImage(file).subscribe({
      next: (res) => {
        this.value = res.url;
        this.uploading.set(false);
        input.value = '';
        this.valueChange.emit(res.url);
      },
      error: () => {
        this.uploadError.set('Upload fehlgeschlagen. Bitte erneut versuchen.');
        this.uploading.set(false);
        input.value = '';
      },
    });
  }
}
