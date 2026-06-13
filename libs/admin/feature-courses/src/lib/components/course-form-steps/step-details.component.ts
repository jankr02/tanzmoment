import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AdminApiService } from '@tanzmoment/admin/data-access';

@Component({
  selector: 'admin-step-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-details.component.html',
  styleUrls: ['./step-basics.component.scss', './step-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepDetailsComponent {
  private readonly adminApi = inject(AdminApiService);

  @Input({ required: true }) form!: FormGroup;

  @ViewChild('imageInput', { static: true })
  private readonly imageInput!: ElementRef<HTMLInputElement>;

  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  triggerUpload(): void {
    this.imageInput.nativeElement.click();
  }

  removeImage(): void {
    this.form.get('imageUrl')?.setValue('');
    this.uploadError.set(null);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.adminApi.uploadCourseImage(file).subscribe({
      next: (res) => {
        this.form.get('imageUrl')?.setValue(res.url);
        this.uploading.set(false);
        input.value = '';
      },
      error: () => {
        this.uploadError.set('Upload fehlgeschlagen. Bitte erneut versuchen.');
        this.uploading.set(false);
        input.value = '';
      },
    });
  }
}
