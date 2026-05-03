import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNewsService } from '@tanzmoment/admin/data-access';

@Component({
  selector: 'admin-cover-image-upload',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cover-upload">
      <div class="cover-upload__preview" *ngIf="value">
        <img [src]="value" alt="Coverbild" />
        <button type="button" class="cover-upload__remove" (click)="remove()" aria-label="Coverbild entfernen">×</button>
      </div>

      <div class="cover-upload__actions">
        <button type="button" class="cover-upload__btn" (click)="trigger()" [disabled]="uploading()">
          {{ uploading() ? 'Lädt hoch…' : value ? 'Coverbild austauschen' : 'Coverbild hochladen' }}
        </button>
      </div>

      <input
        #fileInput
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        (change)="onFile($event)"
      />
    </div>
  `,
  styles: [`
    .cover-upload {
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 12px);
    }
    .cover-upload__preview {
      position: relative;
      border-radius: var(--radius-md, 12px);
      overflow: hidden;
      max-width: 480px;
      img { width: 100%; height: auto; display: block; }
    }
    .cover-upload__remove {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }
    .cover-upload__btn {
      background: var(--color-primary-light, #f2ece3);
      color: var(--color-text-primary, #2e2a25);
      border: 1px dashed var(--color-border, #e6ded7);
      border-radius: var(--radius-md, 12px);
      padding: 12px 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      align-self: flex-start;
      min-height: 44px;

      &:hover:not(:disabled) {
        background: var(--color-accent, #fdf8f3);
      }

      &:disabled {
        opacity: 0.6;
        cursor: wait;
      }
    }
  `],
})
export class CoverImageUploadComponent {
  private readonly api = inject(AdminNewsService);

  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string | null>();
  @ViewChild('fileInput', { static: true }) private readonly fileInput!: ElementRef<HTMLInputElement>;

  readonly uploading = signal(false);

  trigger(): void { this.fileInput.nativeElement.click(); }

  remove(): void {
    this.value = null;
    this.valueChange.emit(null);
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.api.uploadCover(file).subscribe({
      next: (res) => {
        this.value = res.url;
        this.valueChange.emit(res.url);
        this.uploading.set(false);
        input.value = '';
      },
      error: () => {
        this.uploading.set(false);
        input.value = '';
        window.alert('Upload fehlgeschlagen.');
      },
    });
  }
}
