import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'custom';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon?: string;
  @Input() loading = false;

  /** Custom background color (only used with variant="custom") */
  @Input() color?: string;

  /** Custom text color (only used with variant="custom") */
  @Input() textColor?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  @HostBinding('style.--btn-custom-bg')
  get customBgStyle(): string | null {
    return this.color ?? null;
  }

  @HostBinding('style.--btn-custom-text')
  get customTextStyle(): string | null {
    return this.textColor ?? null;
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
