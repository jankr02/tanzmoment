import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="avatarClasses">
      @if (isValidImageUrl) {
        <img [src]="imageUrl" [alt]="name" class="avatar__image" />
      } @else {
        <div class="avatar__fallback">
          {{ initials }}
        </div>
      }
    </div>
  `,
  styles: `
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
      overflow: hidden;
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-brand), var(--color-secondary));
      color: white;

      &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &__fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: inherit;
      }

      // Size variants
      &--xs {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      &--sm {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      &--md {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }

      &--lg {
        width: 48px;
        height: 48px;
        font-size: 16px;
      }

      &--xl {
        width: 64px;
        height: 64px;
        font-size: 20px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  @Input() name: string = 'User';
  @Input() imageUrl?: string;
  @Input() size: AvatarSize = 'md';

  get initials(): string {
    return this.name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  get avatarClasses(): string {
    return `avatar avatar--${this.size}`;
  }

  get isValidImageUrl(): boolean {
    if (!this.imageUrl) return false;
    // Check if it's a valid URL (starts with http, /, or data:)
    return /^(https?:\/\/|\/|data:)/.test(this.imageUrl);
  }
}
