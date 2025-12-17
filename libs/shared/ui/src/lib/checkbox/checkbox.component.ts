import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxSize } from './checkbox.types';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  // Configuration
  @Input() id?: string;
  @Input() name?: string;
  @Input() size: CheckboxSize = 'medium';
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() errorMessage?: string;

  // State
  @Input() disabled = false;
  @Input() required = false;
  @Input() hasError = false;
  @Input() indeterminate = false;
  @Input() labelPosition: 'left' | 'right' = 'right';

  // Events
  @Output() checkedChange = new EventEmitter<boolean>();

  // Internal state
  checked = false;
  isFocused = false;

  // ControlValueAccessor callbacks
  private onChange: (value: boolean) => void = () => {
    // Will be set by registerOnChange
  };
  private onTouched: () => void = () => {
    // Default onTouched implementation
  };

  /**
   * Get container classes based on state
   */
  get containerClasses(): string[] {
    const classes = ['checkbox', `checkbox--${this.size}`];

    if (this.checked) classes.push('checkbox--checked');
    if (this.isFocused) classes.push('checkbox--focused');
    if (this.hasError) classes.push('checkbox--error');
    if (this.disabled) classes.push('checkbox--disabled');
    if (this.indeterminate) classes.push('checkbox--indeterminate');
    if (this.labelPosition === 'left') classes.push('checkbox--label-left');

    return classes;
  }

  /**
   * Get helper/error text to display
   */
  get displayText(): string {
    if (this.hasError && this.errorMessage) {
      return this.errorMessage;
    }
    return this.helperText || '';
  }

  /**
   * Check if should show helper text
   */
  get shouldShowHelperText(): boolean {
    return !!this.displayText;
  }

  /**
   * Toggle checkbox state
   */
  toggle(): void {
    if (this.disabled) return;

    this.checked = !this.checked;
    this.indeterminate = false;
    this.onChange(this.checked);
    this.checkedChange.emit(this.checked);
  }

  /**
   * Handle keyboard events
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  /**
   * Handle focus
   */
  onFocus(): void {
    this.isFocused = true;
  }

  /**
   * Handle blur
   */
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ControlValueAccessor Implementation
  // ────────────────────────────────────────────────────────────────────────────

  writeValue(value: boolean): void {
    this.checked = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
